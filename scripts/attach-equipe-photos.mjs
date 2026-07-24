import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const PHOTOS_DIR = '/tmp/equipe-photos-new/photo équipe';

const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } = process.env;
const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_API_TOKEN,
  useCdn: false,
});

const MATCHES = {
  'Adeline 2.jpg': 'equipeMember.adeline-stocklouser',
  'Ambre.jpg': 'equipeMember.ambre-ludwiczak',
  'claude.jpg': 'equipeMember.claude-danielle-morlet',
  'Delphine.jpg': 'equipeMember.delphine-luriaud',
  'Dominique.jpg': 'equipeMember.dominique-borie-lagarde',
  'Guilhem.jpg': 'equipeMember.guilhem-loupiac',
  'Hiroshi.jpg': 'equipeMember.hiroshi',
  'Loubna.jpg': 'equipeMember.loubna',
  'Perrine.jpg': 'equipeMember.perrine-marillier',
};

async function main() {
  for (const [filename, docId] of Object.entries(MATCHES)) {
    const filePath = path.join(PHOTOS_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    const asset = await client.assets.upload('image', buffer, { filename });
    await client.patch(docId).set({ image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }).commit();
    console.log(`${filename} -> ${docId} OK`);
  }
  console.log('Terminé.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
