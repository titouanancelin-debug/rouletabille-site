import { defineField, defineType } from 'sanity';
import { richTextField } from './shared/richText';

export const equipeMember = defineType({
  name: 'equipeMember',
  title: 'Membre de l\'équipe',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nom', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', title: 'Rôle', type: 'string' }),
    defineField({
      name: 'categorie', title: 'Catégorie', type: 'string',
      options: { list: ['permanente', 'associee', 'conseil_administration'] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'image', title: 'Photo', type: 'image' }),
    defineField({ name: 'bio', title: 'Bio', ...richTextField }),
    defineField({ name: 'quote', title: 'Citation (optionnel)', type: 'string' }),
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'image' } },
});
