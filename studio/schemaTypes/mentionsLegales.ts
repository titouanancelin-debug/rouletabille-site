import { defineField, defineType } from 'sanity';
import { richTextField } from './shared/richText';
import { sectionsLibresField } from './shared/sectionsLibres';

export const mentionsLegales = defineType({
  name: 'mentionsLegales',
  title: 'Mentions légales',
  type: 'document',
  fields: [
    sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
    defineField({ name: 'associationName', title: 'Nom de l\'association', type: 'string' }),
    defineField({ name: 'siege', title: 'Siège social', type: 'string' }),
    defineField({ name: 'siret', title: 'SIRET', type: 'string' }),
    defineField({ name: 'representante', title: 'Représentante légale', type: 'string' }),
    defineField({ name: 'contactEmail', title: 'Email de contact', type: 'string' }),
    defineField({ name: 'hebergeurNom', title: 'Hébergeur — nom', type: 'string' }),
    defineField({ name: 'hebergeurAdresse', title: 'Hébergeur — adresse', type: 'string' }),
    defineField({ name: 'hebergeurUrl', title: 'Hébergeur — URL', type: 'string' }),
    defineField({ name: 'proprieteIntellectuelle', title: 'Propriété intellectuelle', ...richTextField }),
    defineField({ name: 'donneesPersonnelles', title: 'Données personnelles (RGPD)', ...richTextField }),
    defineField({ name: 'cookies', title: 'Cookies', ...richTextField }),
    sectionsLibresField('sections', 'Sections libres (bas de page)'),
  ],
});
