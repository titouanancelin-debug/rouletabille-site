import { defineField, defineType } from 'sanity';
import { pageHeaderFields } from './pageSections';
import { richTextField } from './shared/richText';
import { sectionsLibresField } from './shared/sectionsLibres';

// Page "Spectacles de la compagnie" dans Archives : reprend le contenu de
// l'ancienne page de blog Overblog "Les créations de la compagnie"
// (chronologie commentée des créations depuis 1993), recréé directement sur
// le nouveau site plutôt que sous forme de simples liens vers les archives.
export const creationsCompagniePage = defineType({
  name: 'creationsCompagniePage',
  title: 'Page Spectacles de la compagnie',
  type: 'document',
  fields: [
    ...pageHeaderFields,
    defineField({
      name: 'creations',
      title: 'Créations',
      type: 'array',
      description: 'Ordre = ordre d\'affichage (glisser-déposer pour réordonner).',
      of: [{
        type: 'object',
        name: 'creationItem',
        fields: [
          defineField({
            name: 'year',
            title: 'Année',
            type: 'string',
            description: 'Ex. "2024", ou "2012/2013" pour une création à cheval sur deux saisons. Laisser vide si inconnue.',
          }),
          defineField({ name: 'title', title: 'Titre', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({
            name: 'archiveArticle',
            title: 'Article d\'archive lié',
            type: 'reference',
            to: [{ type: 'archiveArticle' }],
            description: 'Optionnel. Si renseigné, le titre de la création devient un lien vers cet article d\'archive.',
          }),
          defineField({
            name: 'photo',
            title: 'Photo',
            type: 'image',
            options: { hotspot: true },
            description: 'Optionnelle. Affichée en vignette à côté du titre dans la liste.',
          }),
          defineField({ name: 'description', title: 'Description', ...richTextField }),
          defineField({
            name: 'videoUrl',
            title: 'Vidéo (lien YouTube, optionnel)',
            type: 'url',
            validation: (Rule) => Rule.uri({ allowRelative: false, scheme: ['http', 'https'] }),
          }),
          sectionsLibresField('sections', 'Sections (photos, texte, citation...) — optionnel, pour enrichir la fiche au-delà de la description'),
        ],
        preview: { select: { title: 'title', subtitle: 'year', media: 'photo' } },
      }],
    }),
  ],
});
