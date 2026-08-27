/* Logique de date/tri/archivage de l'agenda, partagée entre l'agenda lui-même
   (screens.jsx) et les écrans d'archives (archives.jsx, creationsCompagnie.jsx,
   projetsTerritoire.jsx) — un seul endroit pour ne pas faire diverger deux
   implémentations de "c'est quoi la date d'une entrée agenda". */

/* Accepte aussi bien l'abréviation ("sep") que le nom complet ("septembre")
   saisi dans Sanity : une saisie CMS en toutes lettres ne doit pas, elle non
   plus, faire disparaître silencieusement un rendez-vous. */
export const FR_MONTHS_IDX = {
  jan:0, janvier:0, fév:1, février:1, mar:2, mars:2, avr:3, avril:3, mai:4,
  juin:5, juil:6, juillet:6, août:7, sep:8, septembre:8, oct:9, octobre:9,
  nov:10, novembre:10, déc:11, décembre:11,
};

/* Les entrées d'agenda n'ont pas d'identifiant unique (contrairement aux
   spectacles) — le slug est dérivé du titre + de la date, ce qui est stable
   tant que ces champs ne changent pas et fonctionne aussi bien pour les
   entrées JSON que pour les occurrences d'ateliers générées à la volée. */
export const slugify = (s) => (s || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export const agendaSlug = (d) => slugify(
  d.periodStart
    ? `${d.title || ""}-${d.periodStart}-${d.periodEnd || ""}`
    : `${d.title || ""}-${d.day || ""}-${d.month || ""}-${d.year || ""}`
);

/* Plage de dates à partir des champs day/month/year (texte libre Sanity) —
   premier/dernier nombre du champ jour pour gérer les plages "20 au 24", mois
   insensible à la casse/abrégé. Renvoie null si la date est incomplète/mal
   formée : ces entrées sont alors reléguées en fin de liste plutôt que de
   casser le tri.

   Un projet de territoire de longue durée (periodStart/periodEnd, voir
   "Période" dans le Studio) n'a pas de day/month/year : sa plage vient
   directement de ces deux dates ISO. */
export const agendaEntryDate = (d) => {
  if (d.periodStart) {
    const start = new Date(d.periodStart);
    return { start, end: d.periodEnd ? new Date(d.periodEnd) : start };
  }
  const monthIdx = FR_MONTHS_IDX[(d.month || "").trim().toLowerCase()];
  const nums = String(d.day || "").match(/\d+/g);
  if (monthIdx === undefined || !nums || !d.year) return null;
  return {
    start: new Date(+d.year, monthIdx, +nums[0]),
    end: new Date(+d.year, monthIdx, +nums[nums.length - 1]),
  };
};

const FR_MONTHS_FULL_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/* Libellé affiché pour la date d'une entrée d'agenda : "20 Mars 2026" pour
   une entrée classique, ou "Septembre 2024 → Mars 2026" pour un projet de
   territoire en "Période" (même mois/année de début et de fin : un seul
   "Mois Année", pas de flèche). */
export const formatAgendaDate = (d) => {
  if (d.periodStart) {
    const start = new Date(d.periodStart);
    const startLabel = `${FR_MONTHS_FULL_NAMES[start.getMonth()]} ${start.getFullYear()}`;
    if (!d.periodEnd) return startLabel;
    const end = new Date(d.periodEnd);
    if (end.getFullYear() === start.getFullYear() && end.getMonth() === start.getMonth()) return startLabel;
    return `${startLabel} → ${FR_MONTHS_FULL_NAMES[end.getMonth()]} ${end.getFullYear()}`;
  }
  return [d.day, d.month, d.year].filter(Boolean).join(" ");
};

/* Trie par proximité avec aujourd'hui plutôt que par ordre chronologique
   brut : à venir (ou en cours) d'abord, du plus proche au plus lointain,
   puis le passé (le plus récemment terminé en premier). */
export const sortByDate = (list) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return [...list].sort((a, b) => {
    const ra = agendaEntryDate(a), rb = agendaEntryDate(b);
    if (!ra && !rb) return 0;
    if (!ra) return 1;
    if (!rb) return -1;
    const aFuture = ra.end >= today;
    const bFuture = rb.end >= today;
    if (aFuture !== bFuture) return aFuture ? -1 : 1;
    return aFuture ? ra.start - rb.start : rb.start - ra.start;
  });
};

/* Jour de la semaine (lundi=0 … dimanche=6) de la date de départ d'une
   entrée — pour les ateliers réguliers, l'ordre naturel est "quel jour de la
   semaine" plutôt que "quelle date calendaire". */
const toMondayFirst = (jsDay) => (jsDay + 6) % 7; // JS: dimanche=0 → lundi=0

export const sortByWeekday = (list) => {
  return [...list].sort((a, b) => {
    const ra = agendaEntryDate(a), rb = agendaEntryDate(b);
    if (!ra && !rb) return 0;
    if (!ra) return 1;
    if (!rb) return -1;
    const wa = toMondayFirst(ra.start.getDay());
    const wb = toMondayFirst(rb.start.getDay());
    if (wa !== wb) return wa - wb;
    return ra.start - rb.start;
  });
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/* Un rendez-vous récurrent (hebdomadaire/mensuel) n'apparaît jamais dans
   AGENDA avec une date passée : expandRecurrence (recurrence.js) ne génère
   que des occurrences à partir d'aujourd'hui. Seules les entrées ponctuelles
   peuvent donc être "vieilles de plus d'un an". */
export const isArchived = (entry, now = new Date()) => {
  if (entry.recurrence && entry.recurrence !== "ponctuel") return false;
  if (entry.periodStart && !entry.periodEnd) return false; // projet en cours, fin pas encore connue
  const range = agendaEntryDate(entry);
  if (!range) return false;
  return now - range.end > ONE_YEAR_MS;
};

/* Répartit l'agenda entre rendez-vous actifs et rendez-vous archivés
   (>1 an), ces derniers classés par type vers la section d'archives qui leur
   correspond : Spectacles de la compagnie / Projets de territoire / archives
   générales pour le reste (atelier, résidence, médiation, événement). */
export const splitArchivedAgenda = (AGENDA, now = new Date()) => {
  const current = [], archivedSpectacles = [], archivedTerritoire = [], archivedGeneral = [];
  for (const entry of AGENDA) {
    if (!isArchived(entry, now)) { current.push(entry); continue; }
    if (entry.type?.includes("spectacle")) archivedSpectacles.push(entry);
    else if (entry.type?.includes("projet de territoire")) archivedTerritoire.push(entry);
    else archivedGeneral.push(entry);
  }
  return { current, archivedSpectacles, archivedTerritoire, archivedGeneral };
};
