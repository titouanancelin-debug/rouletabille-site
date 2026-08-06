import { defineField, defineType } from 'sanity';

// Identité de marque + réseaux sociaux : regroupe ce qui était dupliqué en
// dur à plusieurs endroits du site (Nav, Footer, variantes du hero Accueil).
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  fields: [
    defineField({ name: 'brandName', title: 'Nom de la marque', type: 'string' }),
    defineField({ name: 'brandTaglineLine1', title: 'Tagline — ligne 1', type: 'string' }),
    defineField({ name: 'brandTaglineLine2', title: 'Tagline — ligne 2', type: 'string' }),
    defineField({ name: 'heroLocation', title: 'Localisation (carte hero)', type: 'string' }),
    defineField({ name: 'heroFounded', title: 'Année de création (carte hero)', type: 'string' }),
    defineField({ name: 'instagramUrl', title: 'Instagram', type: 'url' }),
    defineField({ name: 'facebookUrl', title: 'Facebook', type: 'url' }),
    defineField({ name: 'linkedinUrl', title: 'LinkedIn', type: 'url' }),
    defineField({ name: 'helloAssoUrl', title: 'HelloAsso', type: 'url' }),
  ],
});
