import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

// `createClient` jette une exception si projectId est absent : si les variables
// d'env ne sont pas encore configurées sur l'hébergeur, on ne veut pas planter
// tout le site (main.jsx importe ce module au niveau racine), juste la page Archives.
export const sanityClient = projectId
  ? createClient({ projectId, dataset, apiVersion: '2024-01-01', useCdn: true })
  : { fetch: () => Promise.resolve(null) };

const builder = projectId ? imageUrlBuilder(sanityClient) : null;
export const urlFor = (source) => builder.image(source);
