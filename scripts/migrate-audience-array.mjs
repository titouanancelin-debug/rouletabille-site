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

// Le champ agenda.audience passe de string à array de strings (public de
// l'atelier choisissable en plusieurs catégories, ex: adultes + ados).
// Convertit les documents existants (et leurs drafts) sans perte.
const allDocs = await client.fetch(`*[_type == 'agenda' && defined(audience)]{_id, audience}`);
const docs = allDocs.filter((d) => typeof d.audience === 'string');

console.log(`${docs.length} document(s) à migrer.`);

const tx = client.transaction();
for (const doc of docs) {
  console.log(`- ${doc._id}: "${doc.audience}" -> ["${doc.audience}"]`);
  tx.patch(doc._id, (p) => p.set({ audience: [doc.audience] }));
}

if (docs.length) {
  await tx.commit();
  console.log('Migration terminée.');
} else {
  console.log('Rien à migrer.');
}
