import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

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

// Seed les nouveaux champs CMS (voir plan "rendre le maximum de contenu
// éditorial pilotable depuis le CMS") avec les valeurs actuellement codées
// en dur en JSX, pour que rien ne disparaisse du site au moment où le
// front-end bascule sur ces champs à la place des constantes.
// createIfNotExists + patch().set() (jamais createOrReplace) pour ne jamais
// écraser du contenu existant (sectionsHaut/sections déjà remplies etc.).

async function ensureAndPatch(id, type, fields) {
  await client.createIfNotExists({ _id: id, _type: type });
  await client.patch(id).set(fields).commit();
  console.log(`✓ ${id}`);
}

// 1. Nouveaux singletons
await ensureAndPatch('menu', 'menu', {
  labelHome: 'Accueil',
  labelSpectacles: 'Notre travail',
  labelAgenda: 'Agenda',
  labelEquipe: 'Équipe',
  labelPartenaires: 'Partenaires',
  labelContact: 'Contact',
  labelArchives: 'Archives',
});

await ensureAndPatch('siteSettings', 'siteSettings', {
  brandName: 'Rouletabille',
  brandTaglineLine1: 'Fabrique artistique',
  brandTaglineLine2: 'et culturelle',
  heroLocation: 'Périgueux · Dordogne',
  heroFounded: 'Est. 1993',
  instagramUrl: 'https://www.instagram.com/rouletabilletheatre',
});

// 2. Accueil
await ensureAndPatch('home', 'home', {
  eventsHeader: { eyebrow: 'Au programme', titleMain: 'Prochains', titleItalic: 'rendez-vous.', meta: 'Spectacles, résidences et événements de la saison.' },
  histoireHeader: { eyebrow: 'Histoire', titleMain: 'Histoire', titleItalic: "d'un projet.", meta: "Depuis 1993, un projet culturel ancré dans le quartier du Toulon, à Périgueux." },
  publicsHeader: { eyebrow: 'Publics', titleMain: 'Un lieu ouvert', titleItalic: 'à toutes et tous.' },
  publicsTags: ['Enfants', 'Jeunes', 'Adultes', 'Habitants', 'Professionnels', 'Amateurs', 'Écoles', 'Structures sociales et médico-sociales', 'Collectivités'],
});

// 3. Footer
await ensureAndPatch('footer', 'footer', {
  colDecouvrirTitle: 'Découvrir',
  colPratiqueTitle: 'Pratique',
  colSuivreTitle: 'Suivre',
  linkVenirAtelier: "Venir à l'atelier",
  linkDossiersPresse: 'Dossiers de presse',
  linkMentionsLegales: 'Mentions légales',
  linkNewsletter: 'Newsletter',
});

// 4. Contact
await ensureAndPatch('contact', 'contact', {
  headerEyebrow: 'Nous joindre',
  headerTitleMain: 'Écrivez-nous,',
  headerTitleItalic: 'passez nous voir.',
});

// 5. Presse (+ upload des 3 fichiers du kit presse comme assets Sanity)
const pressFiles = [
  { file: 'logo-cie-rouletabille.svg', label: 'Logo (SVG)', description: 'Motif physalis, fond transparent' },
  { file: 'photo-physalis-1.jpg', label: 'Visuel physalis 1 (JPG)', description: 'Macro du motif végétal de la compagnie — haute définition, libre de droits' },
  { file: 'photo-physalis-2.jpg', label: 'Visuel physalis 2 (JPG)', description: 'Macro du motif végétal de la compagnie — haute définition, libre de droits' },
];
const pressKit = [];
for (const item of pressFiles) {
  const filePath = path.join(PUBLIC_DIR, 'presse', item.file);
  const asset = await client.assets.upload('file', fs.createReadStream(filePath), { filename: item.file });
  pressKit.push({
    _type: 'pressKitItem',
    _key: item.file.replace(/[^a-z0-9]/gi, ''),
    file: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } },
    label: item.label,
    description: item.description,
  });
  console.log(`  ↳ uploaded ${item.file}`);
}

await ensureAndPatch('presse', 'presse', {
  headerEyebrow: 'Presse',
  headerTitleMain: 'Dossier de',
  headerTitleItalic: 'presse.',
  headerMeta: 'Présentation de la compagnie et visuels libres de droits pour la presse.',
  telechargementsLabel: 'Téléchargements',
  introInterview: "Pour toute demande d'interview, de photo supplémentaire ou d'accréditation, écrivez-nous directement :",
  pressKit,
});

// 6. Agenda (en-tête + configs de catégories)
await ensureAndPatch('agendaPage', 'agendaPage', {
  headerEyebrow: 'Saison',
  headerTitleMain: 'Agenda.',
  typeConfig: [
    { _type: 'typeConfigItem', _key: 'spectacle', value: 'spectacle', label: 'Spectacle', color: 'var(--terra)' },
    { _type: 'typeConfigItem', _key: 'atelier', value: 'atelier', label: 'Atelier', color: 'var(--plum)' },
    { _type: 'typeConfigItem', _key: 'residence', value: 'résidence', label: 'Résidence', color: 'var(--aubergine)' },
    { _type: 'typeConfigItem', _key: 'evenement', value: 'événement', label: 'Événement', color: 'var(--amber-deep)' },
    { _type: 'typeConfigItem', _key: 'mediation', value: 'médiation', label: 'Médiation', color: 'var(--amber-deep)' },
    { _type: 'typeConfigItem', _key: 'territoire', value: 'projet de territoire', label: 'Projet de territoire', color: 'var(--plum)' },
  ],
  statusConfig: [
    { _type: 'statusConfigItem', _key: 'available', value: 'available', label: 'Places disponibles', color: 'var(--terra)' },
    { _type: 'statusConfigItem', _key: 'few', value: 'few', label: 'Dernières places', color: 'var(--amber-deep)' },
    { _type: 'statusConfigItem', _key: 'sold', value: 'sold', label: 'Complet', color: 'var(--ink-soft)' },
    { _type: 'statusConfigItem', _key: 'free', value: 'free', label: 'Entrée libre', color: 'var(--plum)' },
  ],
  audienceConfig: [
    { _type: 'audienceConfigItem', _key: 'enfants', value: 'enfants', label: 'Enfants (6–11 ans)' },
    { _type: 'audienceConfigItem', _key: 'ados', value: 'ados', label: 'Ados (12–17 ans)' },
    { _type: 'audienceConfigItem', _key: 'adultes', value: 'adultes', label: 'Adultes' },
    { _type: 'audienceConfigItem', _key: 'quartier', value: 'quartier', label: 'Quartier & résidents' },
  ],
  audienceAllLabel: 'Tous les ateliers',
});

// 7. Notre travail (Spectacles)
await ensureAndPatch('spectaclesPage', 'spectaclesPage', {
  headerEyebrow: 'Notre travail',
  headerTitleMain: 'Résidences, médiations',
  headerTitleItalic: '& événements.',
  headerMeta: 'Un lieu de fabrication artistique ancré sur son territoire — de la résidence de création aux ateliers de pratique ouverts à tous.',
  travailTabs: [
    { _type: 'travailTabsItem', _key: 'residences', value: 'residences', label: 'Résidences artistiques', title: 'Résidences artistiques', intro: "Les résidences de création sont le cœur de notre travail. Des semaines de répétition, d'expérimentation et de recherche, loin de la représentation — là où la forme se cherche encore.", emptyMessage: 'Aucune résidence en cours actuellement.' },
    { _type: 'travailTabsItem', _key: 'ateliers', value: 'ateliers', label: 'Ateliers réguliers', title: 'Ateliers & pratique', intro: 'Ateliers réguliers à la Filature de l\'Isle et en quartier. Activités gratuites ou à tarif accessible. Inscriptions ouvertes.', emptyMessage: 'Aucun atelier dans cette catégorie pour le moment.' },
    { _type: 'travailTabsItem', _key: 'evenements', value: 'evenements', label: 'Événements', title: 'Événements', intro: "Rencontres avec l'équipe, restitutions publiques, ouvertures de résidences… Des moments partagés, ouverts à tous.", emptyMessage: 'Aucun événement à venir pour le moment.' },
    { _type: 'travailTabsItem', _key: 'mediations', value: 'mediations', label: 'Médiations', title: 'Médiations & pratiques', intro: 'La transmission artistique est une activité centrale, pas accessoire. Interventions scolaires, actions de territoire, médiation culturelle.', emptyMessage: 'Aucune médiation programmée pour le moment.' },
    { _type: 'travailTabsItem', _key: 'territoire', value: 'territoire', label: 'Projets de territoire', title: 'Projets de territoire', intro: "Des projets artistiques et culturels co-construits avec les habitants, les partenaires et les structures d'un territoire, sur le temps long.", emptyMessage: 'Aucun projet de territoire en cours actuellement.' },
  ],
});

// 8. Ateliers (en-tête seulement — reprend le même texte que l'onglet "Ateliers réguliers" de Notre travail)
await ensureAndPatch('ateliersPage', 'ateliersPage', {
  headerEyebrow: 'Pratiques',
  headerTitleMain: 'Ateliers',
  headerTitleItalic: '& pratiques.',
  headerMeta: 'Ateliers réguliers à la Filature de l\'Isle et en quartier. Activités gratuites ou à tarif accessible. Inscriptions ouvertes.',
});

// 9. Équipe
await ensureAndPatch('equipePage', 'equipePage', {
  headerEyebrow: 'Équipe',
  headerTitleMain: 'Un collectif au service',
  headerTitleItalic: 'de la création.',
  headerMeta: 'Rouletabille est une association portée par un conseil d\'administration, une équipe permanente et un réseau d\'artistes associés. Les décisions artistiques et le développement du projet se construisent collectivement, dans une logique de coopération et de responsabilité partagée.',
  compagnonsBlock: {
    eyebrow: 'Compagnons de route',
    texte: "Depuis plus de trente ans, Rouletabille grandit grâce à toutes celles et ceux qui croisent son chemin. Artistes, technicien·nes, costumières, constructeur·rices, bénévoles, salarié·es, volontaires en service civique, stagiaires… chacun·e a contribué, à sa manière, à faire vivre la compagnie et ce lieu de création. Une fabrique artistique se construit autant avec celles et ceux qui l'animent aujourd'hui qu'avec toutes les personnes qui en ont écrit l'histoire.",
    noms: ['Justine', 'Mathieu', 'David', 'Antonio', 'Léon', 'Sylvano', 'Will', 'Guillaume', 'Cyril', 'Coline', 'Delphine', 'Margaux', 'Hamza', 'Rime', 'Pierre', 'Marie', 'Lucille', 'Margot'],
  },
  benevolesBlock: {
    eyebrow: 'Bénévoles',
    texte: 'Ils accueillent. Ils construisent. Ils installent. Ils cuisinent. Ils transportent. Ils discutent avec le public. Ils ouvrent les portes. Ils font vivre Rouletabille — sans eux, beaucoup de projets n\'existeraient pas.',
    ctaLabel: 'Devenir bénévole →',
  },
});

// 10. Partenaires
await ensureAndPatch('partenairesPage', 'partenairesPage', {
  headerEyebrow: 'Soutiens',
  headerTitleMain: 'Partenaires',
  headerTitleItalic: '& soutiens.',
  headerMeta: 'Plus de 30 partenaires contribuent activement à la vie de la compagnie — institutions, artistes, associations de quartier, écoles.',
  categoryConfig: [
    { _type: 'categoryConfigItem', _key: 'soutien', value: 'Soutien institutionnel', accentColor: 'var(--terra)', bgColor: 'var(--terra)', description: 'Financeurs et soutiens officiels. La Rouletabille fabrique artistique et culturelle est labellisée « Lieu de fabrique » par la Région et l\'Agence Culturelle de la Dordogne.' },
    { _type: 'categoryConfigItem', _key: 'artistiques', value: 'Partenaires artistiques', accentColor: 'var(--plum)', bgColor: 'var(--plum)', description: 'Compagnies et lieux avec lesquels nous créons, co-produisons et co-diffusons en territoire.' },
    { _type: 'categoryConfigItem', _key: 'territoire', value: 'Action culturelle & territoire', accentColor: 'var(--aubergine)', bgColor: 'var(--aubergine)', description: 'Associations, centres sociaux et acteurs de terrain qui portent avec nous les projets de médiation culturelle en Dordogne.' },
    { _type: 'categoryConfigItem', _key: 'education', value: 'Éducation', accentColor: '#7A6010', bgColor: 'var(--amber)', description: 'Établissements scolaires et structures éducatives partenaires de nos interventions artistiques.' },
  ],
});

// 11. Archives (nouvelle page, n'existait pas du tout côté CMS)
await ensureAndPatch('archivesPage', 'archivesPage', {
  headerEyebrow: 'Mémoire',
  headerTitleMain: 'Archives',
  headerTitleItalic: 'du blog.',
  headerMeta: 'Toutes les actualités, projets et carnets de création de la compagnie.',
});

console.log('\nMigration terminée.');
