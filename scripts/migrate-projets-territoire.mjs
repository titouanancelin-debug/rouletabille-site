import 'dotenv/config';
import { createClient } from '@sanity/client';

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
  console.error('Variables manquantes dans scripts/.env (SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN).');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_API_TOKEN,
  useCdn: false,
});

// Regroupe des articles d'archive déjà migrés (voir archiveArticle) sous
// 3 projets de territoire, à la demande de l'utilisateur (03/2026 — voir
// session). Les slugs ci-dessous ont été vérifiés existants avant migration.
const ref = (slug) => ({ _type: 'reference', _ref: `archiveArticle.${slug}`, _key: slug });

const projects = [
  {
    title: 'Carnet de Vie',
    articles: [
      ref('carnet-de-vies'),
      ref('exposition-au-csc-l-arche'),
      ref('les-projets-creatifs-avec-les-conseils-citoyens-a-l-honneur'),
    ],
  },
  {
    title: 'Grands Témoins — Boulazac',
    articles: [
      ref('batiment-5-appartement-14'),
    ],
  },
  {
    title: 'Vivre Ensemble 1 & 2',
    articles: [
      ref('projet-vivre-ensembles'),
      ref('vivre-ensemble'),
      ref('une-nouvelle-aventure-theatrale'),
    ],
  },
];

await client.createIfNotExists({ _id: 'projetsTerritoirePage', _type: 'projetsTerritoirePage' });
await client.patch('projetsTerritoirePage').set({
  headerEyebrow: 'Ancrage local',
  headerTitleMain: 'Projets de',
  headerTitleItalic: 'territoire.',
  headerMeta: 'Des créations menées avec les habitants, les quartiers et les partenaires du territoire.',
  projects: projects.map((p) => ({ ...p, _type: 'territoryProject', _key: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60) })),
}).commit();

console.log(`✓ projetsTerritoirePage (${projects.length} projets, ${projects.reduce((a, p) => a + p.articles.length, 0)} articles référencés)`);
