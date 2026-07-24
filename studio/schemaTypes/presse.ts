import { defineField, defineType } from 'sanity';
import { richTextField } from './shared/richText';
import { sectionsLibresField } from './shared/sectionsLibres';

export const presse = defineType({
  name: 'presse',
  title: 'Presse',
  type: 'document',
  fields: [
    defineField({ name: 'intro', title: 'Intro', ...richTextField }),
    sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
    defineField({ name: 'contactEmail', title: 'Email de contact presse', type: 'string' }),
    sectionsLibresField('sections', 'Sections libres (bas de page)'),
  ],
});
