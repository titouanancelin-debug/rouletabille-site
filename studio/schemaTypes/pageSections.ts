import { defineField, defineType } from 'sanity';
import { sectionsLibresField } from './shared/sectionsLibres';

// L'en-tête fixe (sur-titre / titre bicolore / paragraphe) qui coiffe chaque
// page à liste, avant les sections libres — jusqu'ici codé en dur en JSX sur
// chaque page, désormais un bloc de champs réutilisable.
export const pageHeaderFields = [
  defineField({ name: 'headerEyebrow', title: 'En-tête — sur-titre', type: 'string' }),
  defineField({ name: 'headerTitleMain', title: 'En-tête — titre (partie normale)', type: 'string' }),
  defineField({ name: 'headerTitleItalic', title: 'En-tête — titre (partie italique)', type: 'string' }),
  defineField({ name: 'headerMeta', title: 'En-tête — paragraphe', type: 'text' }),
];

// Tableau de config pour une liste de catégories fixes (type d'agenda,
// statut, public, catégories de partenaires...). Le champ "value" est en
// lecture seule : l'équipe modifie le libellé/la couleur/la description des
// catégories existantes, mais n'en crée pas de nouvelles elle-même (ça
// demanderait aussi de toucher le champ correspondant dans le schéma du
// document concerné, ex: agenda.type).
export const configArrayField = (name: string, title: string, extraFields: any[]) =>
  defineField({
    name, title, type: 'array',
    of: [{
      type: 'object',
      name: `${name}Item`,
      fields: [
        defineField({ name: 'value', title: 'Valeur (technique, non modifiable)', type: 'string', readOnly: true }),
        ...extraFields,
      ],
      preview: { select: { title: 'label', subtitle: 'value' } },
    }],
  });

// Chaque collection à liste (agenda, spectacles, équipe, partenaires) a ses
// propres sections libres de haut/bas de page, séparées des documents de la
// liste elle-même. La page Ateliers n'a plus de liste du tout depuis
// l'unification dans l'agenda : uniquement des sections libres.
const pageSectionsType = (name: string, title: string, extraFields: any[] = []) =>
  defineType({
    name,
    title,
    type: 'document',
    fields: [
      ...pageHeaderFields,
      ...extraFields,
      sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
      sectionsLibresField('sections', 'Sections libres (bas de page)'),
    ],
  });

export const agendaPage = pageSectionsType('agendaPage', 'Page Agenda (sections)', [
  configArrayField('typeConfig', 'Configuration des types de rendez-vous', [
    defineField({ name: 'label', title: 'Libellé affiché', type: 'string' }),
    defineField({ name: 'color', title: 'Couleur (variable CSS ou hex)', type: 'string' }),
  ]),
  configArrayField('statusConfig', 'Configuration des statuts', [
    defineField({ name: 'label', title: 'Libellé affiché', type: 'string' }),
    defineField({ name: 'color', title: 'Couleur (variable CSS ou hex)', type: 'string' }),
  ]),
  configArrayField('audienceConfig', 'Configuration des publics', [
    defineField({ name: 'label', title: 'Libellé affiché', type: 'string' }),
  ]),
  defineField({ name: 'audienceAllLabel', title: 'Libellé du filtre "Tous"', type: 'string' }),
]);

export const spectaclesPage = pageSectionsType('spectaclesPage', 'Page Spectacles (sections)', [
  configArrayField('travailTabs', 'Onglets "Notre travail"', [
    defineField({ name: 'label', title: 'Libellé de l\'onglet', type: 'string' }),
    defineField({ name: 'title', title: 'Légende affichée à côté des onglets', type: 'string' }),
    defineField({ name: 'intro', title: 'Paragraphe d\'introduction', type: 'text' }),
    defineField({ name: 'emptyMessage', title: 'Message si aucun contenu', type: 'string' }),
  ]),
]);

export const equipePage = pageSectionsType('equipePage', 'Page Équipe (sections)', [
  defineField({
    name: 'compagnonsBlock', title: 'Bloc "Compagnons de route"', type: 'object',
    fields: [
      { name: 'eyebrow', title: 'Sur-titre', type: 'string' },
      { name: 'texte', title: 'Texte', type: 'text' },
      { name: 'noms', title: 'Prénoms', type: 'array', of: [{ type: 'string' }] },
    ],
  }),
  defineField({
    name: 'benevolesBlock', title: 'Bloc "Bénévoles"', type: 'object',
    fields: [
      { name: 'eyebrow', title: 'Sur-titre', type: 'string' },
      { name: 'texte', title: 'Texte', type: 'text' },
      { name: 'ctaLabel', title: 'Texte du bouton', type: 'string' },
    ],
  }),
]);

export const partenairesPage = pageSectionsType('partenairesPage', 'Page Partenaires (sections)', [
  configArrayField('categoryConfig', 'Configuration des catégories de partenaires', [
    defineField({ name: 'accentColor', title: 'Couleur d\'accent — texte/bordure (variable CSS ou hex)', type: 'string' }),
    defineField({ name: 'bgColor', title: 'Couleur de fond — logo sans image (variable CSS ou hex)', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
  ]),
]);

export const ateliersPage = pageSectionsType('ateliersPage', 'Page Ateliers (sections)');
export const archivesPage = pageSectionsType('archivesPage', 'Page Archives (sections)');
