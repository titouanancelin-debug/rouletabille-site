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

// Les deux texteBlock "Une association engagée..." / "Une association
// impliquée..." de la page Équipe n'avaient pas de champ largeur (ajouté au
// schéma en même temps que ce script) et retombaient donc sur le plafond par
// défaut de 760px, laissant un grand vide à droite faute d'image en
// vis-à-vis. On les passe explicitement en largeur "pleine".
const doc = await client.fetch(`*[_id == 'equipePage'][0]{_id, sections}`);
if (!doc) {
  console.error('Document equipePage introuvable.');
  process.exit(1);
}

const targets = (doc.sections || [])
  .filter((s) => s._type === 'texteBlock')
  .map((s) => s._key);

console.log(`${targets.length} texteBlock(s) trouvé(s) sur equipePage : ${targets.join(', ')}`);

if (targets.length) {
  const tx = client.transaction();
  for (const key of targets) {
    tx.patch(doc._id, (p) => p.set({ [`sections[_key=="${key}"].largeur`]: 'pleine' }));
  }
  await tx.commit();
  console.log('Migration terminée.');
} else {
  console.log('Rien à migrer.');
}
