import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const token = import.meta.env.VITE_SANITY_READ_TOKEN;

// `createClient` jette une exception si projectId est absent : si les variables
// d'env ne sont pas encore configurées sur l'hébergeur, on ne veut pas planter
// tout le site (main.jsx importe ce module au niveau racine), juste la page Archives.
// Le token est un token "Viewer" (lecture seule) : sûr à exposer côté client,
// nécessaire car la lecture publique anonyme du dataset ne renvoie pas les
// documents archiveArticle malgré le dataset marqué "public".
// `perspective: 'published'` : ne renvoie que les documents publiés, même si
// un brouillon existe en parallèle (sinon un document ouvert dans Studio sans
// être republié apparaît en double sur le site public — brouillon + publié).
export const sanityClient = projectId
  ? createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: !token, perspective: 'published' })
  : { fetch: () => Promise.resolve(null) };

const builder = projectId ? imageUrlBuilder(sanityClient) : null;
export const urlFor = (source) => builder.image(source);
