import 'dotenv/config';
import { createClient } from '@sanity/client';

// Enrichit et relie à leur article d'archive les 4 premières créations de la
// page "Spectacles de la compagnie" (creationsCompagniePage). Nécessite que
// le schéma `creationItem` ait déjà le champ `archiveArticle` (voir
// studio/schemaTypes/creationsCompagniePage.ts) déployé dans le Studio.
//
// Usage : node scripts/enrich-first-creations.mjs

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

const block = (text) => ({
  _type: 'block', _key: Math.random().toString(36).slice(2, 12), style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 12), text, marks: [] }],
});

const updates = [
  {
    key: 'les-trois-fantastiques',
    archiveSlug: 'theatre-et-expression-plastique-pour-un-choix-bien-eveille',
    description: [
      block("Création théâtralisée retraçant le destin de trois femmes illustres — Jeanne Barret, Jenny Sacerdote et Emma Reyes — à la demande de la Ville de Périgueux, qui a fait voter élèves et habitants pour donner leur nom au nouveau groupe scolaire du Gour-de-l'Arche."),
      block("Un cycle associant création théâtrale, ateliers d'expression plastique avec les jeunes élèves et visites de lieux symboliques, mené avec Emilie Esquerrée (Cie Lilo), jusqu'à l'inauguration de l'école Emma Reyes le 6 septembre 2024."),
    ],
  },
  {
    key: 'l-envol',
    archiveSlug: 'l-envol-creation-en-cours-spectacle-des-8-ans',
    description: [
      block("Conte musical et marionnettique porté par la migration des grues cendrées, entre légendes et récits initiatiques : « suivre les grues et tenter de comprendre ce qui les anime », pour « découvrir ce qui nous aide à grandir »."),
      block("Né en résidences à partir de 2020 avec Loubna Chebouti et Léon Maunoury, le spectacle se présente depuis 2023 sous forme de lecture musicale, accompagné d'un parcours d'éducation artistique et culturelle mené auprès de collégiens."),
    ],
  },
  {
    key: 'la-vorace',
    archiveSlug: 'la-vorace-poesie-rock',
    description: [
      block("Interprétation rock de la poésie engagée de Jean-Pierre Siméon (« Levez-vous du tombeau », « L'Arbre m'a dit »), portée par un quintet contrebasse / guitare électrique / batterie / clavier / voix : « une insolence à la fois sauvage et joyeuse »."),
      block("Avec Mathieu Bérenger, David Jalliffier-Verne, Cyril Lababidi, Guillaume Pasquet et Loubna Chebouti au dire et au chant."),
    ],
  },
  {
    key: 'agri-culture-',
    archiveSlug: 'agri-culture',
    description: [
      block("Création réalisée à partir de témoignages d'agriculteurs collectés par la MSA Dordogne, avec Mathieu Bérenger et Claude Danielle Morlet : le monde agricole raconté dans ses difficultés, ses contraintes et sa passion, confronté à notre regard de consommateurs."),
      block("Spectacle parlé, raconté, joué, chanté et mis en musique — une comédienne raconte leurs vies, elle se raconte aussi ; un musicien l'accompagne dans son parcours. Joué dans toute la Dordogne et au-delà (Baumes-les-Dames), souvent suivi d'un débat avec le public."),
    ],
  },
];

async function main() {
  const page = await client.fetch(`*[_id == "creationsCompagniePage"][0]{creations}`);
  if (!page) { console.error('creationsCompagniePage introuvable.'); process.exit(1); }

  for (const u of updates) {
    const item = (page.creations || []).find((c) => c._key === u.key);
    if (!item) { console.warn(`! creationItem introuvable pour _key="${u.key}", ignoré`); continue; }

    const archiveDoc = await client.fetch(`*[_type == "archiveArticle" && slug.current == $slug][0]{_id}`, { slug: u.archiveSlug });
    if (!archiveDoc) { console.warn(`! archiveArticle introuvable pour slug="${u.archiveSlug}", ignoré`); continue; }

    await client.patch('creationsCompagniePage')
      .set({
        [`creations[_key=="${u.key}"].description`]: u.description,
        [`creations[_key=="${u.key}"].archiveArticle`]: { _type: 'reference', _ref: archiveDoc._id },
      })
      .commit();
    console.log(`✓ ${u.key} → lié à "${u.archiveSlug}", description enrichie`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
