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

// Trois champs passent d'un simple textarea (type "text") à du Portable
// Text (gras/italique/lien) : agenda.desc, creationsCompagniePage.creations[].
// description, projetsTerritoirePage.projects[].description. Convertit les
// valeurs string existantes en un bloc Portable Text équivalent (un seul
// paragraphe, aucune perte de contenu) — les documents déjà migrés ou vides
// sont ignorés.
const key = () => Math.random().toString(36).slice(2, 12);

const toBlock = (text) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
});

const tx = client.transaction();
let count = 0;

// 1. agenda.desc
const agendaDocs = await client.fetch(`*[_type == 'agenda' && defined(desc)]{_id, desc}`);
for (const doc of agendaDocs.filter((d) => typeof d.desc === 'string' && d.desc.trim())) {
  console.log(`- agenda ${doc._id}: desc -> Portable Text`);
  tx.patch(doc._id, (p) => p.set({ desc: [toBlock(doc.desc)] }));
  count++;
}

// 2. creationsCompagniePage.creations[].description
const creationsPage = await client.fetch(`*[_id == 'creationsCompagniePage'][0]{_id, creations}`);
for (const c of (creationsPage?.creations || [])) {
  if (typeof c.description === 'string' && c.description.trim()) {
    console.log(`- creationsCompagniePage: "${c.title}" -> Portable Text`);
    tx.patch(creationsPage._id, (p) => p.set({ [`creations[_key=="${c._key}"].description`]: [toBlock(c.description)] }));
    count++;
  }
}

// 3. projetsTerritoirePage.projects[].description
const territoirePage = await client.fetch(`*[_id == 'projetsTerritoirePage'][0]{_id, projects}`);
for (const p of (territoirePage?.projects || [])) {
  if (typeof p.description === 'string' && p.description.trim()) {
    console.log(`- projetsTerritoirePage: "${p.title}" -> Portable Text`);
    tx.patch(territoirePage._id, (patch) => patch.set({ [`projects[_key=="${p._key}"].description`]: [toBlock(p.description)] }));
    count++;
  }
}

if (count) {
  await tx.commit();
  console.log(`Migration terminée (${count} champ(s)).`);
} else {
  console.log('Rien à migrer.');
}
