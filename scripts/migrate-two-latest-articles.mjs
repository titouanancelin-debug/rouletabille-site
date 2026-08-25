import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(__dirname, '.two-articles-assets');

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } = process.env;
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
  console.error(
    'Variables manquantes. Renseigne scripts/.env avec SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN (token avec droits "Editor").'
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

// Les 2 articles publiés sur rouletabilletheatre.com depuis le dernier
// instantané migré (voir scripts/migrate-archives.mjs, snapshot du
// 01/07/2026 — plus vieux que ces deux articles de juillet). Récupérés
// directement depuis le site en ligne (le template Overblog actuel est
// rendu côté client, pas de HTML statique à parser comme pour l'ancien
// export) : texte et métadonnées repris du JSON-LD de chaque page +
// extraction manuelle du corps, images téléchargées dans
// scripts/.two-articles-assets/ (gitignored, à nettoyer après migration).
const key = () => Math.random().toString(36).slice(2, 12);
const block = (children) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children });
const span = (text, marks = []) => ({ _type: 'span', _key: key(), text, marks });

const ARTICLES = [
  {
    slug: 'la-saison-26-27',
    title: 'La Saison 26-27...',
    publishedAt: '2026-07-22T15:20:37+02:00',
    author: 'Compagnie Rouletabille Théâtre',
    mainImage: 'plaquette-26-27-recto.jpg',
    body: [
      { image: 'plaquette-26-27-recto.jpg' },
      { image: 'plaquette-26-27-verso.jpg' },
    ],
  },
  {
    slug: 'maillage-sensible-projet-artistique-de-territoire-mai-2026-decembre-2027',
    title: 'Maillage sensible - Projet artistique de territoire mai 2026 - décembre 2027',
    publishedAt: '2026-07-22T15:00:00+02:00',
    author: 'Compagnie Rouletabille Théâtre',
    mainImage: 'maillage-sensible.jpg',
    body: [
      { text: '« Maillage Sensible »' },
      { text: 'À partir de mai 2026, Rouletabille déploie « Maillage Sensible », un projet soutenu dans le cadre du FEADER, pensé comme une traversée artistique et humaine entre divers territoires.' },
      { text: 'Résidences d’artistes, ateliers, médiations, créations participatives et temps de rencontres viendront tisser des liens entre habitants, artistes et partenaires du territoire autour des questions du vivant, du soin, de la parentalité et des relations humaines.' },
      { text: 'Le projet se développera de mai 2026 à décembre 2027 et prendra notamment la forme d’un premier temps fort durant les vacances d’automne : la Quinzaine artistique « Ce qui nous relie #1 », menée avec plusieurs partenaires du territoire et des équipes artistiques locales.' },
      { image: 'maillage-sensible.jpg' },
      { text: 'Pensée comme un espace de convergence des dynamiques engagées tout au long du projet, cette quinzaine mêlera formes artistiques, laboratoires de recherche, ateliers immersifs, débats, rencontres et propositions ouvertes au public.' },
      { text: 'Première étape : une installation poético-artistique in situ « Éprise », samedi 13 juin 2026, à Fontroubade (Lacropte) dans le cadre de la nuit des Forêts.' },
      { text: 'Premier temps fort de ce projet, « Éprise » explore le reprisage végétal d’objets anciens à travers dentelles de feuilles, nervures, gestes attentifs et matières fragiles.' },
      { text: 'À partir de collectes situées — objets usés, végétaux, traces du quotidien — Ambre Ludwiczak développe une recherche sensible autour de la mémoire, de l’usure et des liens invisibles qui relient personnes, lieux et temporalités.' },
      { text: 'Une forme évolutive issue des collectes et des médiations menées sur le territoire sera présentée lors de la Quinzaine artistique.' },
      { text: 'Plus d’informations et programmation complète à venir prochainement sur les réseaux et supports de communication de Rouletabille.' },
    ],
  },
];

async function uploadImage(filename) {
  const absPath = path.join(ASSETS_DIR, filename);
  const buffer = fs.readFileSync(absPath);
  const asset = await client.assets.upload('image', buffer, { filename });
  return asset._id;
}

async function migrateArticle(art) {
  console.log(`- ${art.title} (${art.slug})`);

  const imageCache = new Map();
  const assetIdFor = async (filename) => {
    if (!imageCache.has(filename)) imageCache.set(filename, await uploadImage(filename));
    return imageCache.get(filename);
  };

  const mainImageAssetId = await assetIdFor(art.mainImage);

  const body = [];
  for (const item of art.body) {
    if (item.text) {
      body.push(block([span(item.text)]));
    } else if (item.image) {
      const assetId = await assetIdFor(item.image);
      body.push({ _type: 'image', _key: key(), asset: { _type: 'reference', _ref: assetId } });
    }
  }

  const doc = {
    _id: `archiveArticle.${art.slug}`,
    _type: 'archiveArticle',
    title: art.title,
    slug: { _type: 'slug', current: art.slug },
    publishedAt: art.publishedAt,
    author: art.author,
    mainImage: { _type: 'image', asset: { _type: 'reference', _ref: mainImageAssetId } },
    body,
  };

  await client.createOrReplace(doc);
}

async function main() {
  for (const art of ARTICLES) {
    await migrateArticle(art);
  }
  console.log(`\nTerminé. ${ARTICLES.length} article(s) créé(s)/mis à jour.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
