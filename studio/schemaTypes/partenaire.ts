import { defineField, defineType } from 'sanity';

export const partenaire = defineType({
  name: 'partenaire',
  title: 'Partenaire',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nom', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'type', title: 'Type', type: 'string',
      options: { list: ['Action culturelle & territoire', 'Partenaires artistiques', 'Soutien institutionnel', 'Éducation'] },
    }),
    defineField({ name: 'image', title: 'Logo', type: 'image' }),
    defineField({ name: 'url', title: 'Site web', type: 'url' }),
  ],
  preview: { select: { title: 'name', subtitle: 'type', media: 'image' } },
});
