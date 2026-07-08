/* Génère les occurrences futures d'un atelier récurrent (hebdomadaire ou
   mensuel) sous forme d'entrées "virtuelles" au même format que l'agenda,
   pour éviter de les créer une par une à la main. Ces entrées ne sont pas
   des documents Tina : elles sont recalculées à chaque affichage, à partir
   des champs de récurrence de l'atelier — donc pas de clic-pour-éditer sur
   elles (on édite la règle de récurrence sur l'atelier lui-même). Tout le
   calcul se fait en UTC pour éviter les décalages de fuseau horaire /
   changements d'heure d'été-hiver. */

const FR_MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const WEEKDAY_INDEX = { dimanche:0, lundi:1, mardi:2, mercredi:3, jeudi:4, vendredi:5, samedi:6 };
const MAX_OCCURRENCES_PER_ATELIER = 60;
const HORIZON_MONTHS = 12;

function startOfUTCDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function toAgendaDateFields(date) {
  return {
    day: String(date.getUTCDate()).padStart(2, "0"),
    month: FR_MONTHS[date.getUTCMonth()],
    year: String(date.getUTCFullYear()),
  };
}

/* nth : "1" à "4" (nième occurrence du jour dans le mois) ou "dernier". */
function nthWeekdayOfMonth(year, monthIdx, weekday, nth) {
  if (nth === "dernier") {
    const last = new Date(Date.UTC(year, monthIdx + 1, 0));
    const diff = (last.getUTCDay() - weekday + 7) % 7;
    return new Date(Date.UTC(year, monthIdx, last.getUTCDate() - diff));
  }
  const first = new Date(Date.UTC(year, monthIdx, 1));
  const diff = (weekday - first.getUTCDay() + 7) % 7;
  const day = 1 + diff + (Number(nth) - 1) * 7;
  const d = new Date(Date.UTC(year, monthIdx, day));
  if (d.getUTCMonth() !== monthIdx) return null; // ex: pas de 5e mardi ce mois-ci
  return d;
}

function makeGeneratedEntry(a, date) {
  return {
    ...toAgendaDateFields(date),
    title: a.title,
    venue: a.where,
    time: a.recurrenceTime || a.when,
    price: a.price,
    status: "available",
    type: "atelier",
    cardColor: a.color,
    cardTextColor: a.textColor,
    image: a.image || null,
    spectacle: null,
  };
}

export function expandAtelierRecurrence(ateliers, now = new Date()) {
  const today = startOfUTCDay(now);
  const horizon = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + HORIZON_MONTHS, today.getUTCDate()));

  const out = [];
  for (const a of ateliers) {
    if (!a.recurrence || a.recurrence === "ponctuel" || !a.recurrenceStart) continue;
    const weekday = WEEKDAY_INDEX[a.recurrenceDay];
    if (weekday === undefined) continue;

    const start = startOfUTCDay(new Date(a.recurrenceStart));
    const end = a.recurrenceEnd ? startOfUTCDay(new Date(a.recurrenceEnd)) : horizon;
    const windowStart = start > today ? start : today;
    const windowEnd = end < horizon ? end : horizon;
    if (windowStart > windowEnd) continue;

    let count = 0;

    if (a.recurrence === "hebdomadaire") {
      const diff = (weekday - windowStart.getUTCDay() + 7) % 7;
      let cur = new Date(Date.UTC(windowStart.getUTCFullYear(), windowStart.getUTCMonth(), windowStart.getUTCDate() + diff));
      while (cur <= windowEnd && count < MAX_OCCURRENCES_PER_ATELIER) {
        out.push(makeGeneratedEntry(a, cur));
        cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate() + 7));
        count++;
      }
    } else if (a.recurrence === "mensuel") {
      let cursorYear = windowStart.getUTCFullYear();
      let cursorMonth = windowStart.getUTCMonth();
      const endYear = windowEnd.getUTCFullYear();
      const endMonth = windowEnd.getUTCMonth();
      while (
        (cursorYear < endYear || (cursorYear === endYear && cursorMonth <= endMonth)) &&
        count < MAX_OCCURRENCES_PER_ATELIER
      ) {
        const occ = nthWeekdayOfMonth(cursorYear, cursorMonth, weekday, a.recurrenceWeekOfMonth || "1");
        if (occ && occ >= windowStart && occ <= windowEnd) {
          out.push(makeGeneratedEntry(a, occ));
          count++;
        }
        cursorMonth++;
        if (cursorMonth > 11) { cursorMonth = 0; cursorYear++; }
      }
    }
  }
  return out;
}
