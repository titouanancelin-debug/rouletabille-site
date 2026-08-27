import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { createClient } from '@sanity/client';

// Le scrape Overblog d'origine se termine souvent par un widget "à lire
// aussi" (div.ob-ctn.ob-ctn--withImage) : vignette + titre + extrait + URL
// d'un site tiers, totalement étranger à l'article. La migration initiale
// (migrate-archives.mjs) laissait passer ce texte (seule la vignette externe
// était correctement écartée, faute de fichier image local). Ce script
// retire ces blocs précis des articles concernés, en se basant sur le texte
// exact extrait du HTML source pour ne rien supprimer d'autre.
//
// Usage :
//   node scripts/strip-overblog-widgets.mjs           (dry-run, n'écrit rien)
//   node scripts/strip-overblog-widgets.mjs --apply    (applique les patches)

const SITE_DIR = '/home/cytech/Projets/test_ui-ux-dev-assets/site';
const APPLY = process.argv.includes('--apply');

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
  console.error('Variables manquantes dans scripts/.env (SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN — token avec droits "Editor").');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_API_TOKEN,
  useCdn: false,
});

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

function widgetTexts(file) {
  const htmlPath = path.join(SITE_DIR, file);
  if (!fs.existsSync(htmlPath)) return [];
  const dom = new JSDOM(fs.readFileSync(htmlPath, 'utf8'));
  const content = dom.window.document.querySelector('.post-content');
  if (!content) return [];
  return [...content.querySelectorAll('.ob-ctn--withImage')].map((widget) => ({
    title: norm(widget.querySelector('.ob-title')?.textContent),
    snippet: norm(widget.querySelector('.ob-snippet')?.textContent),
    url: norm(widget.querySelector('.ob-url')?.textContent),
  }));
}

async function main() {
  const articles = JSON.parse(fs.readFileSync(path.join(SITE_DIR, 'articles.json'), 'utf8'));
  const results = [];

  for (const art of articles) {
    const widgets = widgetTexts(art.file);
    if (widgets.length === 0) continue;
    const slug = art.file.replace(/^articles\//, '').replace(/\.html$/, '');

    const doc = await client.fetch(`*[_type == "archiveArticle" && slug.current == $slug][0]{_id, body}`, { slug });
    if (!doc) { results.push({ slug, status: 'absent-de-sanity' }); continue; }

    const junkTexts = new Set();
    for (const w of widgets) {
      if (w.title) junkTexts.add(w.title);
      if (w.snippet) junkTexts.add(w.snippet);
      if (w.url) junkTexts.add(w.url);
    }

    const before = doc.body?.length || 0;
    const newBody = (doc.body || []).filter((b) => {
      if (b._type !== 'block') return true;
      const text = norm((b.children || []).map((c) => c.text || '').join(''));
      return !junkTexts.has(text);
    });
    const removed = before - newBody.length;

    if (removed === 0) { results.push({ slug, status: 'rien-a-retirer (texte déjà différent ?)' }); continue; }

    results.push({ slug, status: `${removed} bloc(s) à retirer`, junkTexts: [...junkTexts] });

    if (APPLY) {
      await client.patch(doc._id).set({ body: newBody }).commit();
      console.log(`✓ ${slug} — ${removed} bloc(s) retiré(s)`);
    }
  }

  console.log(`\n${APPLY ? 'Appliqué' : 'Dry-run (rien écrit — relancer avec --apply pour appliquer)'} : ${results.length} article(s) concerné(s).\n`);
  for (const r of results) console.log(`- ${r.slug}: ${r.status}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
