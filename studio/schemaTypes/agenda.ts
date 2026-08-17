import { defineField, defineType } from 'sanity';
import { MultiDateCalendarInput } from './components/MultiDateCalendarInput';

// Collection centrale voulue par l'équipe : spectacles, ateliers, résidences,
// événements... tout au même endroit, avec récurrence portée par l'entrée
// elle-même (voir js/recurrence.js côté site). Pas de collection Ateliers
// séparée : c'est justement ce qui avait cassé l'indexeur TinaCloud.
const isRecurrent = (document?: Record<string, unknown>) => {
  const r = document?.recurrence as string | undefined;
  return r === 'hebdomadaire' || r === 'mensuel';
};

export const agenda = defineType({
  name: 'agenda',
  title: 'Agenda',
  type: 'document',
  // Regroupe les ~20 champs en sections repliables plutôt qu'une longue
  // liste plate : plus facile à parcourir, et les champs de récurrence
  // (souvent inutiles) sont masqués par défaut.
  fieldsets: [
    { name: 'principal', title: 'Informations principales' },
    { name: 'pratique', title: 'Infos pratiques' },
    { name: 'visuel', title: 'Présentation visuelle', options: { collapsible: true, collapsed: true } },
    { name: 'fichier', title: 'Pièce jointe (dossier PDF)', options: { collapsible: true, collapsed: true } },
    {
      name: 'dates', title: 'Dates',
      description: 'Choisir UNE seule des trois méthodes ci-dessous, selon le rendez-vous : "Date" pour une date ou une plage de dates fixe, "Dates ponctuelles" pour un atelier avec plusieurs jours cochés au calendrier, ou "Récurrence" pour un rendez-vous qui revient chaque semaine/mois.',
    },
  ],
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (Rule) => Rule.required(), fieldset: 'principal' }),
    defineField({
      name: 'type', title: 'Type', type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['résidence', 'atelier', 'médiation', 'événement', 'projet de territoire', 'spectacle'] },
      validation: (Rule) => Rule.required().min(1),
      fieldset: 'principal',
    }),
    defineField({ name: 'status', title: 'Statut', type: 'string', options: { list: ['available', 'few', 'sold', 'free'] }, fieldset: 'principal' }),
    defineField({ name: 'spectacle', title: 'Spectacle lié', type: 'reference', to: [{ type: 'spectacle' }], fieldset: 'principal' }),
    defineField({ name: 'desc', title: 'Description', type: 'text', fieldset: 'principal' }),

    defineField({ name: 'venue', title: 'Lieu', type: 'string', fieldset: 'pratique' }),
    defineField({ name: 'time', title: 'Horaire (texte libre)', type: 'string', fieldset: 'pratique' }),
    defineField({ name: 'price', title: 'Prix / mention', type: 'string', fieldset: 'pratique' }),
    defineField({
      name: 'audience', title: 'Public (catégories, pour filtrer les ateliers)', type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['enfants', 'ados', 'adultes', 'quartier'] },
      fieldset: 'pratique',
    }),
    defineField({ name: 'who', title: 'Public (texte libre, ex: "8-12 ans")', type: 'string', fieldset: 'pratique' }),
    defineField({
      name: 'residenceLink', title: 'Lien vers la page de la compagnie accueillie', type: 'url',
      hidden: ({ document }) => !(document?.type as string[] | undefined)?.includes('résidence'),
      fieldset: 'pratique',
    }),

    defineField({ name: 'image', title: 'Image', type: 'image', fieldset: 'visuel' }),
    defineField({ name: 'cardColor', title: 'Couleur de la carte', type: 'string', fieldset: 'visuel' }),
    defineField({ name: 'cardTextColor', title: 'Couleur du texte de la carte', type: 'string', fieldset: 'visuel' }),

    defineField({
      name: 'dossier', title: 'Dossier (PDF)', type: 'file', fieldset: 'fichier',
      description: 'Dossier de présentation téléchargeable sur la fiche du rendez-vous (résidence, événement, médiation…).',
    }),

    defineField({
      name: 'dateGroup', title: 'Date (rendez-vous ponctuel)', type: 'object',
      fields: [
        { name: 'day', title: 'Jour (ex: "20" ou "20-24")', type: 'string' },
        {
          name: 'month', title: 'Mois', type: 'string',
          options: {
            list: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
          },
          description: 'Liste à choix fixe : évite qu\'une faute de frappe ou une abréviation inattendue fasse disparaître le rendez-vous du site sans erreur visible.',
        },
        { name: 'year', title: 'Année', type: 'string' },
      ],
      hidden: ({ document }) => !!(document?.ponctualDates as string[] | undefined)?.length || isRecurrent(document),
      fieldset: 'dates',
    }),
    defineField({
      name: 'ponctualDates', title: 'Dates ponctuelles (atelier) — cocher les jours sur le calendrier', type: 'array',
      of: [{ type: 'string' }],
      components: { input: MultiDateCalendarInput },
      hidden: ({ document }) => !(document?.type as string[] | undefined)?.includes('atelier'),
      description: 'Pour un atelier avec plusieurs dates ponctuelles (pas de récurrence régulière) : coche chaque date sur le calendrier plutôt que de remplir "Date" ci-dessus.',
      fieldset: 'dates',
    }),
    defineField({
      name: 'recurrence', title: 'Récurrence', type: 'string',
      options: { list: ['ponctuel', 'hebdomadaire', 'mensuel'] },
      initialValue: 'ponctuel',
      fieldset: 'dates',
    }),
    defineField({
      name: 'recurrenceDay', title: 'Jour de la semaine', type: 'string',
      options: { list: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] },
      hidden: ({ document }) => !isRecurrent(document),
      fieldset: 'dates',
    }),
    defineField({
      name: 'recurrenceWeekOfMonth', title: 'Quelle occurrence du mois (mensuel)', type: 'string',
      options: { list: ['1', '2', '3', '4', 'dernier'] },
      hidden: ({ document }) => (document?.recurrence as string | undefined) !== 'mensuel',
      fieldset: 'dates',
    }),
    defineField({
      name: 'recurrenceTime', title: 'Heure de la récurrence', type: 'string',
      hidden: ({ document }) => !isRecurrent(document),
      fieldset: 'dates',
    }),
    defineField({
      name: 'recurrenceStart', title: 'Début de la récurrence', type: 'date',
      hidden: ({ document }) => !isRecurrent(document),
      fieldset: 'dates',
    }),
    defineField({
      name: 'recurrenceEnd', title: 'Fin de la récurrence (optionnel)', type: 'date',
      hidden: ({ document }) => !isRecurrent(document),
      fieldset: 'dates',
    }),
  ],
  preview: {
    select: { title: 'title', type0: 'type.0', media: 'image' },
    prepare({ title, type0, media }) {
      return { title, subtitle: type0, media };
    },
  },
});
