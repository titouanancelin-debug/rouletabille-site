import { defineType } from 'sanity';
import { sectionsLibresField } from './shared/sectionsLibres';

// Chaque collection à liste (agenda, spectacles, équipe, partenaires) a ses
// propres sections libres de haut/bas de page, séparées des documents de la
// liste elle-même. La page Ateliers n'a plus de liste du tout depuis
// l'unification dans l'agenda : uniquement des sections libres.
const pageSectionsType = (name: string, title: string) =>
  defineType({
    name,
    title,
    type: 'document',
    fields: [
      sectionsLibresField('sectionsHaut', 'Sections libres (haut de page)'),
      sectionsLibresField('sections', 'Sections libres (bas de page)'),
    ],
  });

export const agendaPage = pageSectionsType('agendaPage', 'Page Agenda (sections)');
export const spectaclesPage = pageSectionsType('spectaclesPage', 'Page Spectacles (sections)');
export const equipePage = pageSectionsType('equipePage', 'Page Équipe (sections)');
export const partenairesPage = pageSectionsType('partenairesPage', 'Page Partenaires (sections)');
export const ateliersPage = pageSectionsType('ateliersPage', 'Page Ateliers (sections)');
