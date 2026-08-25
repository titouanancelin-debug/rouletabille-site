import { defineField, defineType } from 'sanity';
import { sectionsLibresField } from './shared/sectionsLibres';
import { pageHeaderFields } from './pageSections';

export const contact = defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  fields: [
    ...pageHeaderFields,
    defineField({ name: 'meta', title: 'Mention (horaires/accueil)', type: 'text' }),
    sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
    defineField({ name: 'image', title: 'Photo du lieu', type: 'image' }),
    defineField({
      name: 'mapUrl', title: 'Lien Google Maps', type: 'url',
      description: 'Lien direct vers le lieu sur Google Maps (copier-coller depuis le bouton "Partager" de la fiche du lieu) — affiché en incrustation sur la photo.',
      validation: (Rule) => Rule.uri({ allowRelative: false, scheme: ['http', 'https'] }),
    }),
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
