import 'dotenv/config';
import { createClient } from '@sanity/client';

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
  console.error('Variables manquantes dans scripts/.env (SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN).');
  process.exit(1);
}

// Diagnostic pour "il manque les 2 derniers articles de 2026 dans Archives" :
// interroge l'API live (pas le CDN) avec perspective "raw" pour voir aussi
// les brouillons, et compare avec ce que le site public verrait
// (perspective "published", comme js/sanity-client.js).
const rawClient = createClient({
  projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET,
  apiVersion: '2024-01-01', token: SANITY_API_TOKEN, useCdn: false, perspective: 'raw',
});
const publishedClient = createClient({
  projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET,
  apiVersion: '2024-01-01', token: SANITY_API_TOKEN, useCdn: false, perspective: 'published',
});

const QUERY = `*[_type == "archiveArticle" && publishedAt >= "2026-01-01"] | order(publishedAt desc) {
  _id, title, publishedAt, "isDraft": _id in path("drafts.**")
}`;

const [all, published] = await Promise.all([
  rawClient.fetch(QUERY),
  publishedClient.fetch(QUERY),
]);

console.log(`2026 — tous documents (brouillons inclus) : ${all.length}`);
console.log(`2026 — visibles publiquement (perspective "published", ce que le site utilise) : ${published.length}`);

const publishedIds = new Set(published.map((d) => d._id));
const missing = all.filter((d) => !publishedIds.has(d._id));

if (missing.length === 0) {
  console.log('\nAucun article 2026 manquant côté API — si le site affiche moins d\'articles, la piste la plus probable est le CDN Sanity (useCdn), pas les données elles-mêmes.');
} else {
  console.log(`\n${missing.length} article(s) présents en base mais absents côté public :`);
  for (const d of missing) {
    console.log(`- "${d.title}" (${d.publishedAt}) — ${d.isDraft ? 'BROUILLON non publié' : 'publié mais filtré quand même (à investiguer)'}`);
  }
}
