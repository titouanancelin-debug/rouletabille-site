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

// Recrée le contenu de l'ancienne page de blog Overblog "Les créations de la
// compagnie" (rouletabilletheatre.com/2020/12/les-creations-de-la-compagnie.html)
// directement dans Sanity, pour la nouvelle page /archives/creations-de-la-compagnie.
// Ordre et libellés fidèles à la source (voir historique de session pour le HTML brut).
const creations = [
  { year: '2024', title: 'Les trois Fantastiques', description: 'Lecture-musicale, avec Emilie Esquerrée.' },
  { year: '2020', title: "L'Envol", description: 'Lecture-musicale, avec Loubna Chebouti et Léon Maunoury.' },
  { year: '2020', title: 'La Vorace', description: 'Formation poético-musicale, interprétation des textes de Jean-Pierre Siméon.' },
  {
    year: '2015',
    title: 'Agri(Culture)',
    description: "Création réalisée à partir de témoignages d'agriculteurs collectés par la MSA Dordogne. Avec Mathieu Berenger et Claude Danielle Morlet. Reportage France 3 Franche-Comté : quand une compagnie de théâtre rencontre des témoignages d'agriculteurs... Spectacle parlé, raconté, joué, chanté et mis en musique. Sur la scène, une comédienne raconte leurs vies, elle se raconte aussi ; un musicien l'accompagne dans son parcours.",
    videoUrl: 'https://www.youtube.com/watch?v=gWAzFTdxIUw',
  },
  { year: '2014', title: 'Propos Eco-Logiques', description: 'Création durable et autonome. Avec Claude Danielle Morlet et Antonio Eguilaz-Pariente.' },
  { year: '2012/2013', title: 'La force de nos rêves', description: 'Petite forme autour des traditions de Noël à travers le monde. Avec Claude Danielle Morlet et Dominique Lagarde.' },
  { year: '2011', title: 'Contes et Chansons de Noël', description: 'Petite forme qui conte et raconte la magie de Noël. Avec Yvan Verschueren, Claude Danielle Morlet et Hiroshi Okazaki.' },
  {
    year: '2011',
    title: 'Les véritablement incroyables légendes de St Front',
    description: 'Conférence théâtralisée écrite par Yvan Verschueren, sur la trame du récit historique des fabulations, des légendes : de quoi faire douter sur le vrai et le faux. Avec Yvan Verschueren et Claude Danielle Morlet.',
  },
  {
    year: '2009',
    title: 'Origines et Traditions',
    description: "Spectacle créé à partir d'un recueil de témoignages sur la question des origines de chacun, sur les quartiers du Gour de l'Arche, du Toulon, de Coulounieix-Chamiers et de Boulazac. Mise en scène Claude Danielle Morlet et Hiroshi Okazaki, avec Delphine Bastard et Romain Falguière.",
  },
  {
    year: '2006',
    title: 'Kakéra',
    description: "Spectacle créé à partir d'un album de Katsumi Komagata, adaptation et mise en scène Hiroshi Okazaki et Claude Danielle Morlet, musique de Michel Haze. Représentations en crèches, écoles maternelles, écoles primaires, comités d'entreprises, centres d'accueil spécialisés. Pour jeunes et tout public : le spectacle raconte la difficulté de se sentir unique tout en appartenant au groupe — une démarche qui nécessite l'éloignement, la confrontation, le dépassement pour atteindre l'individualisation et le plaisir d'être.",
    videoUrl: 'https://www.youtube.com/watch?v=-IEeCNWyAy8',
  },
  {
    year: '2003',
    title: 'Parole Donnée',
    description: "Spectacle créé d'après des témoignages d'hommes sur la question du père, avec William Barbiéri, Antonio Eguilaz-Pariente et Patrice Monge. Mise en scène Claude Danielle Morlet et Hiroshi Okazaki. Représentations au Palace à Périgueux, à Excideuil et Montrem.",
  },
  { year: '2000', title: "Le Bonheur c'est (pas) si grand que ça", description: 'Spectacle écrit et interprété par Joséphine Levraut et Claude Danielle Morlet.' },
  {
    year: '1998/1999',
    title: 'Histoire de Désert',
    description: "D'après le texte B.M.C d'Eugène Durif, avec Claude Danielle Morlet. Spectacle co-produit avec le théâtre du Jarnisy, joué au Festival de Théâtre Intime à Jarny (54), au Palace et au NTP à Périgueux.",
  },
  { year: '1997', title: 'Grandir… ? Déjà… !', description: "D'après un texte de Jean Debefve, avec Claude Danielle Morlet et Kamel Abdelli." },
  {
    year: '',
    title: 'De Dunkerque à Tamanrasset',
    description: "1830 : la France envahit l'Algérie. 1954 : l'Algérie entre en guerre… et en 1962 gagne son indépendance. Que connaît-on de ces 132 ans de colonisation ? L'Histoire, la grande, celle enseignée à l'école, demeure silencieuse ; elle nous a aussi longtemps habitués à un regard masculin sur son déroulement. Ce spectacle relaie les trajectoires et les positionnements des femmes dans cette histoire commune…",
    videoUrl: 'https://www.youtube.com/watch?v=toL3599EBgY',
  },
];

await client.createIfNotExists({ _id: 'creationsCompagniePage', _type: 'creationsCompagniePage' });
await client.patch('creationsCompagniePage').set({
  headerEyebrow: 'Depuis 1993',
  headerTitleMain: 'Spectacles de la',
  headerTitleItalic: 'compagnie.',
  headerMeta: "Chronologie des créations de la Cie Rouletabille, de ses premières formes aux dernières résidences.",
  creations: creations.map((c) => ({ ...c, _type: 'creationItem', _key: c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60) })),
}).commit();

console.log(`✓ creationsCompagniePage (${creations.length} créations)`);
