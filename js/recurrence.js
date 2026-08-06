/* Génère les occurrences futures d'un rendez-vous récurrent (hebdomadaire ou
   mensuel) de l'agenda. Un rendez-vous "modèle" récurrent n'a pas de
   day/month/year propres : ce sont les occurrences générées ici qui portent
   une date. Ces occurrences ne sont pas des documents Tina : elles sont
   recalculées à chaque affichage, à partir des champs de récurrence du
   rendez-vous — donc pas de clic-pour-édition sur elles (on édite la règle de
   récurrence sur le rendez-vous modèle lui-même, dans l'agenda). Tout le
   calcul se fait en UTC pour éviter les décalages de fuseau horaire /
   changements d'heure d'été-hiver. */

const FR_MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const WEEKDAY_INDEX = { dimanche:0, lundi:1, mardi:2, mercredi:3, jeudi:4, vendredi:5, samedi:6 };
const MAX_OCCURRENCES_PER_ENTRY = 60;
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

/* Étend tout rendez-vous d'agenda portant une règle de récurrence en
   plusieurs occurrences datées ; les rendez-vous sans récurrence (ou
   "ponctuel") passent tels quels. Chaque occurrence reprend tous les champs
   du modèle (type, description, image, couleurs...), seule la date change. */
export function expandRecurrence(entries, now = new Date()) {
  const today = startOfUTCDay(now);
  const horizon = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + HORIZON_MONTHS, today.getUTCDate()));

  const out = [];
  for (const e of entries) {
    /* Atelier ponctuel avec plusieurs dates cochées sur le calendrier (voir
       studio/schemaTypes/components/MultiDateCalendarInput.tsx) : une
       occurrence par date, à la place du couple dateGroup/day-month-year. */
    if (Array.isArray(e.ponctualDates) && e.ponctualDates.length) {
      for (const iso of e.ponctualDates) {
        out.push({ ...e, ...toAgendaDateFields(new Date(`${iso}T00:00:00Z`)) });
      }
      continue;
    }

    if (!e.recurrence || e.recurrence === "ponctuel" || !e.recurrenceStart) {
      out.push(e);
      continue;
    }
    const weekday = WEEKDAY_INDEX[e.recurrenceDay];
    if (weekday === undefined) { out.push(e); continue; }

    const start = startOfUTCDay(new Date(e.recurrenceStart));
    const end = e.recurrenceEnd ? startOfUTCDay(new Date(e.recurrenceEnd)) : horizon;
    const windowStart = start > today ? start : today;
    const windowEnd = end < horizon ? end : horizon;
    if (windowStart > windowEnd) continue;

    let count = 0;

    if (e.recurrence === "hebdomadaire") {
      const diff = (weekday - windowStart.getUTCDay() + 7) % 7;
      let cur = new Date(Date.UTC(windowStart.getUTCFullYear(), windowStart.getUTCMonth(), windowStart.getUTCDate() + diff));
      while (cur <= windowEnd && count < MAX_OCCURRENCES_PER_ENTRY) {
        out.push({ ...e, ...toAgendaDateFields(cur), time: e.recurrenceTime || e.time });
        cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate() + 7));
        count++;
      }
    } else if (e.recurrence === "mensuel") {
      let cursorYear = windowStart.getUTCFullYear();
      let cursorMonth = windowStart.getUTCMonth();
      const endYear = windowEnd.getUTCFullYear();
      const endMonth = windowEnd.getUTCMonth();
      while (
        (cursorYear < endYear || (cursorYear === endYear && cursorMonth <= endMonth)) &&
        count < MAX_OCCURRENCES_PER_ENTRY
      ) {
        const occ = nthWeekdayOfMonth(cursorYear, cursorMonth, weekday, e.recurrenceWeekOfMonth || "1");
        if (occ && occ >= windowStart && occ <= windowEnd) {
          out.push({ ...e, ...toAgendaDateFields(occ), time: e.recurrenceTime || e.time });
          count++;
        }
        cursorMonth++;
        if (cursorMonth > 11) { cursorMonth = 0; cursorYear++; }
      }
    }
  }
  return out;
}
