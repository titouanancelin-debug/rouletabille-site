/* Données : spectacles, ateliers, agenda, équipe, partenaires */
/* Contenu éditable via Decap CMS (voir /admin) — fichiers sources dans content/ */
import spectaclesData from '../content/spectacles.json';
import agendaData from '../content/agenda.json';
import ateliersData from '../content/ateliers.json';
import equipeData from '../content/equipe.json';
import partenairesData from '../content/partenaires.json';

const SPECTACLES = spectaclesData.spectacles;
const AGENDA = agendaData.agenda;
const ATELIERS = ateliersData.ateliers;
const EQUIPE = equipeData.equipe;
const PARTENAIRES = partenairesData.partenaires;

export { SPECTACLES, AGENDA, ATELIERS, EQUIPE, PARTENAIRES };
