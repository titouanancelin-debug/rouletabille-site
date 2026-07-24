import { defineField, defineType } from 'sanity';

export const archiveArticle = defineType({
  name: 'archiveArticle',
  title: 'Article d\'archive',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'string',
      initialValue: 'Compagnie Rouletabille Théâtre',
    }),
    defineField({
      name: 'mainImage',
      title: 'Photo principale',
      type: 'image',
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image' },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', date: 'publishedAt', media: 'mainImage' },
    prepare({ title, date, media }) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleDateString('fr-FR') : '',
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Date, plus récent',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
