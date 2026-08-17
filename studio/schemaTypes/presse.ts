import { defineField, defineType } from 'sanity';
import { richTextField } from './shared/richText';
import { sectionsLibresField } from './shared/sectionsLibres';
import { pageHeaderFields } from './pageSections';

export const presse = defineType({
  name: 'presse',
  title: 'Documents',
  type: 'document',
  fields: [
    ...pageHeaderFields,
    defineField({ name: 'intro', title: 'Intro', ...richTextField }),
    sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
    defineField({ name: 'telechargementsLabel', title: 'Titre de la liste de téléchargements', type: 'string' }),
    defineField({
      name: 'pressKit', title: 'Documents', type: 'array',
      of: [{
        type: 'object',
        name: 'pressKitItem',
        fields: [
          { name: 'label', title: 'Libellé', type: 'string' },
          { name: 'description', title: 'Description', type: 'string' },
          { name: 'file', title: 'Fichier (pièce jointe)', type: 'file' },
          {
            name: 'url', title: 'Lien externe', type: 'url',
            description: 'À utiliser à la place du fichier pour renvoyer vers une page (ex. la page technique du lieu) plutôt que de joindre un document.',
          },
        ],
        preview: { select: { title: 'label', subtitle: 'description' } },
      }],
    }),
    defineField({ name: 'introInterview', title: 'Phrase d\'intro avant l\'email de contact', type: 'text' }),
    defineField({ name: 'contactEmail', title: 'Email de contact presse', type: 'string' }),
    sectionsLibresField('sections', 'Sections libres (bas de page)'),
  ],
});
