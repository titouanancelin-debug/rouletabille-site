import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { createClient } from '@sanity/client';
import { htmlToBlocks } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../content');

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

const blockContentSchema = Schema.compile({
  name: 'default',
  types: [{ type: 'object', name: 'container', fields: [{ name: 'body', type: 'array', of: [{ type: 'block' }] }] }],
})
  .get('container')
  .fields.find((f) => f.name === 'body').type;

// Champs texte simples (markdown occasionnel, jamais d'image inline dans ce
// contenu) -> Portable Text, en réutilisant la même mécanique que la
// migration des archives (marked pour le markdown éventuel, block-tools pour
// le HTML -> blocs).
function textToBlocks(str) {
  if (!str || !str.trim()) return [];
  const html = marked.parse(str);
  const blocks = htmlToBlocks(html, blockContentSchema, {
    parseHtml: (h) => new JSDOM(h).window.document,
  });
  return blocks.filter((b) => b._type !== 'block' || (b.children || []).some((c) => c._type === 'span' && c.text.trim().length > 0));
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'sans-titre';
}

function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, `${name}.json`), 'utf8'));
}

const docs = [];
function push(doc) {
  docs.push(doc);
}

// ── agenda (collection centrale) ──
const agendaData = readJSON('agenda');
agendaData.agenda.forEach((e, i) => {
  push({
    _id: `agenda.${slugify(e.title)}-${i}`,
    _type: 'agenda',
    title: e.title,
    type: e.type || [],
    status: e.status,
    venue: e.venue,
    time: e.time,
    price: e.price,
    who: e.who,
    audience: e.audience,
    desc: e.desc,
    cardColor: e.cardColor,
    cardTextColor: e.cardTextColor,
    dateGroup: (e.day || e.month || e.year) ? { day: e.day, month: e.month, year: e.year } : undefined,
    recurrence: e.recurrence || 'ponctuel',
    recurrenceDay: e.recurrenceDay,
    recurrenceWeekOfMonth: e.recurrenceWeekOfMonth,
    recurrenceTime: e.recurrenceTime,
    recurrenceStart: e.recurrenceStart,
    recurrenceEnd: e.recurrenceEnd,
    // e.spectacle est un id de spectacle (string) -> référence résolue après coup (voir plus bas)
    _spectacleRef: e.spectacle || null,
  });
});
push({ _id: 'agendaPage', _type: 'agendaPage', sectionsHaut: agendaData.sectionsHaut || [], sections: agendaData.sections || [] });

// ── spectacles ──
const spectaclesData = readJSON('spectacles');
spectaclesData.spectacles.forEach((s) => {
  push({
    _id: `spectacle.${s.id}`,
    _type: 'spectacle',
    title: s.title,
    slug: { _type: 'slug', current: s.id },
    num: s.num,
    tag: s.tag,
    date: s.date,
    duration: s.duration,
    ages: s.ages,
    auteur: s.auteur,
    mes: s.mes,
    with: s.with,
    desc: s.desc,
    color: s.color,
    textColor: s.textColor,
  });
});
push({ _id: 'spectaclesPage', _type: 'spectaclesPage', sectionsHaut: spectaclesData.sectionsHaut || [], sections: spectaclesData.sections || [] });

// ── équipe ──
const equipeData = readJSON('equipe');
equipeData.equipe.forEach((m) => {
  push({
    _id: `equipeMember.${slugify(m.name)}`,
    _type: 'equipeMember',
    name: m.name,
    role: m.role,
    categorie: m.categorie,
    bio: textToBlocks(m.bio),
    quote: m.quote,
  });
});
push({ _id: 'equipePage', _type: 'equipePage', sectionsHaut: equipeData.sectionsHaut || [], sections: equipeData.sections || [] });

// ── partenaires ──
const partenairesData = readJSON('partenaires');
partenairesData.partenaires.forEach((p, i) => {
  push({
    _id: `partenaire.${slugify(p.name)}-${i}`,
    _type: 'partenaire',
    name: p.name,
    type: p.type,
    url: p.url,
  });
});
push({ _id: 'partenairesPage', _type: 'partenairesPage', sectionsHaut: partenairesData.sectionsHaut || [], sections: partenairesData.sections || [] });

// ── ateliers (plus de liste, uniquement des sections) ──
const ateliersData = readJSON('ateliers');
push({ _id: 'ateliersPage', _type: 'ateliersPage', sectionsHaut: ateliersData.sectionsHaut || [], sections: ateliersData.sections || [] });

// ── home ──
const home = readJSON('home').home;
push({
  _id: 'home',
  _type: 'home',
  heroEyebrow: home.heroEyebrow,
  heroLine1: home.heroLine1,
  heroLine2: home.heroLine2,
  heroIntro: textToBlocks(home.heroIntro),
  heroTagline: home.heroTagline,
  sectionsHaut: home.sectionsHaut || [],
  histoire: (home.histoire || []).map((h) => ({ _type: 'histoireItem', _key: slugify(h.label), label: h.label, teaser: h.teaser, texte: textToBlocks(h.texte) })),
  aboutTag: home.aboutTag,
  aboutTitle: home.aboutTitle,
  aboutTexte: textToBlocks(home.aboutTexte),
  publicsIntro: textToBlocks(home.publicsIntro),
  sections: home.sections || [],
});

// ── contact ──
const contact = readJSON('contact').contact;
push({
  _id: 'contact',
  _type: 'contact',
  meta: contact.meta,
  sectionsHaut: contact.sectionsHaut || [],
  addressName: contact.addressName,
  addressLine1: contact.addressLine1,
  addressLine2: contact.addressLine2,
  email: contact.email,
  website: contact.website,
  phone1: contact.phone1,
  phone2: contact.phone2,
  hours: contact.hours,
  access: contact.access || [],
  sections: contact.sections || [],
});

// ── mentionsLegales ──
const ml = readJSON('mentionsLegales').mentionsLegales;
push({
  _id: 'mentionsLegales',
  _type: 'mentionsLegales',
  sectionsHaut: ml.sectionsHaut || [],
  associationName: ml.associationName,
  siege: ml.siege,
  siret: ml.siret,
  representante: ml.representante,
  contactEmail: ml.contactEmail,
  hebergeurNom: ml.hebergeurNom,
  hebergeurAdresse: ml.hebergeurAdresse,
  hebergeurUrl: ml.hebergeurUrl,
  proprieteIntellectuelle: textToBlocks(ml.proprieteIntellectuelle),
  donneesPersonnelles: textToBlocks(ml.donneesPersonnelles),
  cookies: textToBlocks(ml.cookies),
  sections: ml.sections || [],
});

// ── presse ──
const presse = readJSON('presse').presse;
push({
  _id: 'presse',
  _type: 'presse',
  intro: textToBlocks(presse.intro),
  sectionsHaut: presse.sectionsHaut || [],
  contactEmail: presse.contactEmail,
  sections: presse.sections || [],
});

// ── footer ──
const footer = readJSON('footer').footer;
push({ _id: 'footer', _type: 'footer', ...footer });

// ── newsletter ──
const newsletter = readJSON('newsletter').newsletter;
push({ _id: 'newsletter', _type: 'newsletter', ...newsletter });

async function main() {
  console.log(`${docs.length} documents à créer/mettre à jour.`);

  // 1ère passe : créer tous les documents (sans les références spectacle, pas encore résolues)
  for (const doc of docs) {
    const { _spectacleRef, ...clean } = doc;
    await client.createOrReplace(clean);
    process.stdout.write('.');
  }
  console.log('\nDocuments créés.');

  // 2e passe : résoudre les références agenda -> spectacle
  const withSpectacle = docs.filter((d) => d._type === 'agenda' && d._spectacleRef);
  console.log(`${withSpectacle.length} entrées agenda à relier à un spectacle.`);
  for (const doc of withSpectacle) {
    await client.patch(doc._id).set({ spectacle: { _type: 'reference', _ref: `spectacle.${doc._spectacleRef}` } }).commit();
    process.stdout.write('.');
  }
  console.log('\nTerminé.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
