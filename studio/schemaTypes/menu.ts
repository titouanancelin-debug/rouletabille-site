import { defineField, defineType } from 'sanity';

export const menu = defineType({
  name: 'menu',
  title: 'Menu',
  type: 'document',
  fields: [
    defineField({ name: 'labelHome', title: 'Accueil', type: 'string' }),
    defineField({ name: 'labelSpectacles', title: 'Notre travail', type: 'string' }),
    defineField({ name: 'labelAgenda', title: 'Agenda', type: 'string' }),
    defineField({ name: 'labelEquipe', title: 'Équipe', type: 'string' }),
    defineField({ name: 'labelPartenaires', title: 'Partenaires', type: 'string' }),
    defineField({ name: 'labelContact', title: 'Contact', type: 'string' }),
    defineField({ name: 'labelArchives', title: 'Archives', type: 'string' }),
  ],
});
