import { defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';

export const partenaire = defineType({
  name: 'partenaire',
  title: 'Partenaire',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    defineField({ name: 'name', title: 'Nom', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'type', title: 'Type', type: 'string',
      options: { list: ['Action culturelle & territoire', 'Partenaires artistiques', 'Soutien institutionnel', 'Éducation'] },
    }),
    defineField({ name: 'image', title: 'Logo', type: 'image' }),
    defineField({ name: 'url', title: 'Site web', type: 'url' }),
    orderRankField({ type: 'partenaire' }),
  ],
  preview: { select: { title: 'name', subtitle: 'type', media: 'image' } },
});
