import { defineField, defineType } from 'sanity';
import { richTextField } from './shared/richText';
import { sectionsLibresField } from './shared/sectionsLibres';

export const home = defineType({
  name: 'home',
  title: 'Accueil',
  type: 'document',
  fields: [
    defineField({ name: 'heroEyebrow', title: 'Sur-titre du hero', type: 'string' }),
    defineField({ name: 'heroLine1', title: 'Hero — ligne 1', type: 'string' }),
    defineField({ name: 'heroLine2', title: 'Hero — ligne 2', type: 'string' }),
    defineField({ name: 'heroIntro', title: 'Hero — intro', ...richTextField }),
    defineField({ name: 'heroTagline', title: 'Hero — tagline', type: 'string' }),
    sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
    defineField({
      name: 'histoire', title: 'Histoire (accordéon)', type: 'array',
      of: [{
        type: 'object',
        name: 'histoireItem',
        fields: [
          { name: 'label', title: 'Label', type: 'string' },
          { name: 'teaser', title: 'Résumé', type: 'text' },
          { name: 'texte', title: 'Texte complet', ...richTextField },
        ],
        preview: { select: { title: 'label' } },
      }],
    }),
    defineField({ name: 'aboutTag', title: 'À propos — tag', type: 'string' }),
    defineField({ name: 'aboutTitle', title: 'À propos — titre', type: 'string' }),
    defineField({ name: 'aboutTexte', title: 'À propos — texte', ...richTextField }),
    defineField({ name: 'publicsIntro', title: 'Intro publics', ...richTextField }),
    sectionsLibresField('sections', 'Sections libres (bas de page)'),
  ],
});
