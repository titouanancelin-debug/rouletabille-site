import { defineField, defineType } from 'sanity';

export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({ name: 'copyright', title: 'Copyright', type: 'string' }),
    defineField({ name: 'seasonLabel', title: 'Label saison', type: 'string' }),
  ],
});
