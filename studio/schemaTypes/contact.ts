import { defineField, defineType } from 'sanity';
import { sectionsLibresField } from './shared/sectionsLibres';

export const contact = defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  fields: [
    defineField({ name: 'meta', title: 'Mention (horaires/accueil)', type: 'text' }),
    sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
    defineField({ name: 'addressName', title: 'Nom du lieu', type: 'string' }),
    defineField({ name: 'addressLine1', title: 'Adresse — ligne 1', type: 'string' }),
    defineField({ name: 'addressLine2', title: 'Adresse — ligne 2', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'website', title: 'Site web', type: 'string' }),
    defineField({ name: 'phone1', title: 'Téléphone 1', type: 'string' }),
    defineField({ name: 'phone2', title: 'Téléphone 2', type: 'string' }),
    defineField({ name: 'hours', title: 'Horaires', type: 'string' }),
    defineField({ name: 'access', title: 'Accès (une ligne par moyen)', type: 'array', of: [{ type: 'string' }] }),
    sectionsLibresField('sections', 'Sections libres (bas de page)'),
  ],
});
