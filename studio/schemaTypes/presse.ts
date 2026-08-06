import { defineField, defineType } from 'sanity';
import { richTextField } from './shared/richText';
import { sectionsLibresField } from './shared/sectionsLibres';
import { pageHeaderFields } from './pageSections';

export const presse = defineType({
  name: 'presse',
  title: 'Presse',
  type: 'document',
  fields: [
    ...pageHeaderFields,
    defineField({ name: 'intro', title: 'Intro', ...richTextField }),
    sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
    defineField({ name: 'telechargementsLabel', title: 'Titre de la liste de téléchargements', type: 'string' }),
    defineField({
      name: 'pressKit', title: 'Kit presse (téléchargements)', type: 'array',
      of: [{
        type: 'object',
        name: 'pressKitItem',
        fields: [
          { name: 'file', title: 'Fichier', type: 'file' },
          { name: 'label', title: 'Libellé', type: 'string' },
          { name: 'description', title: 'Description', type: 'string' },
        ],
        preview: { select: { title: 'label', subtitle: 'description' } },
      }],
    }),
    defineField({ name: 'introInterview', title: 'Phrase d\'intro avant l\'email de contact', type: 'text' }),
    defineField({ name: 'contactEmail', title: 'Email de contact presse', type: 'string' }),
    sectionsLibresField('sections', 'Sections libres (bas de page)'),
  ],
});
