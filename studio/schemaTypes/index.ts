import { archiveArticle } from './archiveArticle';
import { agenda } from './agenda';
import { spectacle } from './spectacle';
import { equipeMember } from './equipeMember';
import { partenaire } from './partenaire';
import { home } from './home';
import { contact } from './contact';
import { mentionsLegales } from './mentionsLegales';
import { presse } from './presse';
import { footer } from './footer';
import { newsletter } from './newsletter';
import { menu } from './menu';
import { siteSettings } from './siteSettings';
import { agendaPage, spectaclesPage, equipePage, partenairesPage, ateliersPage, archivesPage } from './pageSections';
import { creationsCompagniePage } from './creationsCompagniePage';
import { projetsTerritoirePage } from './projetsTerritoirePage';
import {
  titreBlock, texteBlock, imageBloc, imageTexteBlock, encartBlock, citationBlock, espaceBlock,
} from './shared/sectionsLibres';

export const schemaTypes = [
  // Central : l'agenda d'abord, c'est le point d'entrée principal pour l'équipe.
  agenda,
  spectacle,
  equipeMember,
  partenaire,
  archiveArticle,

  home,
  contact,
  mentionsLegales,
  presse,
  footer,
  newsletter,
  menu,
  siteSettings,
  agendaPage,
  spectaclesPage,
  equipePage,
  partenairesPage,
  ateliersPage,
  archivesPage,
  creationsCompagniePage,
  projetsTerritoirePage,

  // Blocs des sections libres (objets, pas des documents autonomes)
  titreBlock, texteBlock, imageBloc, imageTexteBlock, encartBlock, citationBlock, espaceBlock,
];
