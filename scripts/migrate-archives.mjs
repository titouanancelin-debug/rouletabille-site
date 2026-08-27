import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { createClient } from '@sanity/client';
import { htmlToBlocks } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(__dirname, '../../test_ui-ux-dev-assets/site');
const CACHE_FILE = path.resolve(__dirname, '.image-asset-cache.json');

const LIEN_RE = /^le\s+lien\s+n/i;

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
  console.error(
    'Variables manquantes. Crée scripts/.env avec SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN (token avec droits "Editor").'
  );
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_API_TOKEN,
  useCdn: false,
});

// Schéma minimal, juste assez pour que block-tools sache que "body" accepte block+image
const blockContentSchema = Schema.compile({
  name: 'default',
  types: [
    {
      type: 'object',
      name: 'archiveArticle',
      fields: [
        {
          name: 'body',
          type: 'array',
          of: [{ type: 'block' }, { type: 'image' }],
        },
      ],
    },
  ],
})
  .get('archiveArticle')
  .fields.find((f) => f.name === 'body').type;

let imageCache = {};
if (fs.existsSync(CACHE_FILE)) {
  imageCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
}
function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(imageCache, null, 2));
}

async function uploadImage(relPath) {
  if (!relPath) return null;
  const normalized = relPath.replace(/^\.*\/*/, '');
  if (imageCache[normalized]) return imageCache[normalized];

  const absPath = path.join(SITE_DIR, normalized);
  if (!fs.existsSync(absPath)) {
    console.warn(`  ! image introuvable: ${normalized}`);
    return null;
  }

  const buffer = fs.readFileSync(absPath);
  const asset = await client.assets.upload('image', buffer, {
    filename: path.basename(absPath),
  });
  imageCache[normalized] = asset._id;
  saveCache();
  return asset._id;
}

function resolveImgSrc(src) {
  // même logique que l'ancien archives.jsx : ../../images/x.jpg ou ../images/x.jpg -> images/x.jpg
  return src.replace(/^(\.\.\/)+images\//, 'images/');
}

async function convertToBlocks(html, imgSrcToAssetId) {
  const blocks = htmlToBlocks(html, blockContentSchema, {
    parseHtml: (h) => new JSDOM(h).window.document,
    rules: [
      {
        deserialize(el, next, block) {
          if (el.tagName?.toLowerCase() !== 'img') return undefined;
          const src = el.getAttribute('src') || '';
          const assetId = imgSrcToAssetId.get(src);
          if (!assetId) return [];
          return block({
            _type: 'image',
            asset: { _type: 'reference', _ref: assetId },
          });
        },
      },
    ],
  });
  return blocks.filter((b) => {
    if (b._type !== 'block') return true;
    return (b.children || []).some((c) => c._type === 'span' && c.text.trim().length > 0);
  });
}

function sanitizePostContent(doc) {
  const content = doc.querySelector('.post-content');
  if (!content) return null;

  // Widget Overblog "à lire aussi" (vignette + titre + extrait + URL d'un
  // site tiers, sans rapport avec l'article) et scripts de carrousel : pure
  // pollution qui, si on les laisse passer, apparaît comme un faux dernier
  // paragraphe de l'article avec un lien externe hors-sujet.
  content.querySelectorAll('.ob-ctn--withImage, script').forEach((el) => el.remove());

  content.querySelectorAll('img[src]').forEach((img) => {
    const fixed = resolveImgSrc(img.getAttribute('src') || '');
    img.setAttribute('src', fixed);
    img.removeAttribute('width');
    img.removeAttribute('height');
  });

  content.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('http')) a.removeAttribute('href');
  });

  // Retire les divs vides / wrappers Overblog qui ne contiennent aucun texte ni image
  let changed = true;
  while (changed) {
    changed = false;
    content.querySelectorAll('div').forEach((div) => {
      const hasImg = div.querySelector('img');
      const hasText = div.textContent.trim().length > 0;
      if (!hasImg && !hasText) {
        div.remove();
        changed = true;
      }
    });
  }

  return content;
}

async function migrateArticle(art, index, total) {
  const slug = art.file.replace(/^articles\//, '').replace(/\.html$/, '');
  console.log(`[${index + 1}/${total}] ${art.title} (${slug})`);

  const htmlPath = path.join(SITE_DIR, art.file);
  if (!fs.existsSync(htmlPath)) {
    console.warn(`  ! fichier HTML introuvable, ignoré: ${art.file}`);
    return { slug, status: 'skipped-no-html' };
  }

  const raw = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(raw);
  const content = sanitizePostContent(dom.window.document);

  const imgSrcToAssetId = new Map();
  if (content) {
    const imgs = [...content.querySelectorAll('img[src]')];
    for (const img of imgs) {
      const src = img.getAttribute('src');
      if (!imgSrcToAssetId.has(src)) {
        const assetId = await uploadImage(src);
        if (assetId) imgSrcToAssetId.set(src, assetId);
      }
    }
  }

  const body = content ? await convertToBlocks(content.innerHTML, imgSrcToAssetId) : [];

  const mainImageAssetId = await uploadImage(art.image);

  const doc = {
    _id: `archiveArticle.${slug}`,
    _type: 'archiveArticle',
    title: art.title,
    slug: { _type: 'slug', current: slug },
    publishedAt: art.date_raw,
    author: art.author || 'Compagnie Rouletabille Théâtre',
    ...(mainImageAssetId
      ? { mainImage: { _type: 'image', asset: { _type: 'reference', _ref: mainImageAssetId } } }
      : {}),
    body,
  };

  await client.createOrReplace(doc);
  return { slug, status: 'ok' };
}

async function main() {
  const articlesPath = path.join(SITE_DIR, 'articles.json');
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
  const toMigrate = articles.filter((a) => !LIEN_RE.test(a.title.trim()));

  console.log(`${articles.length} articles au total, ${toMigrate.length} à migrer (bulletins "Le Lien" exclus).\n`);

  const results = [];
  for (let i = 0; i < toMigrate.length; i++) {
    try {
      results.push(await migrateArticle(toMigrate[i], i, toMigrate.length));
    } catch (err) {
      console.error(`  ! échec sur ${toMigrate[i].file}:`, err.message);
      results.push({ slug: toMigrate[i].file, status: 'error', error: err.message });
    }
  }

  const errors = results.filter((r) => r.status !== 'ok');
  console.log(`\nTerminé. ${results.length - errors.length} OK, ${errors.length} en échec/ignorés.`);
  if (errors.length) {
    console.log('Détail des échecs:');
    errors.forEach((e) => console.log(' -', e.slug, e.status, e.error || ''));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
