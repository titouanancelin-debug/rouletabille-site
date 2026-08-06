import { defineField, defineType } from 'sanity';
import { MultiDateCalendarInput } from './components/MultiDateCalendarInput';

// Collection centrale voulue par l'équipe : spectacles, ateliers, résidences,
// événements... tout au même endroit, avec récurrence portée par l'entrée
// elle-même (voir js/recurrence.js côté site). Pas de collection Ateliers
// séparée : c'est justement ce qui avait cassé l'indexeur TinaCloud.
export const agenda = defineType({
  name: 'agenda',
  title: 'Agenda',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'type', title: 'Type', type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['spectacle', 'atelier', 'résidence', 'événement', 'médiation', 'projet de territoire'] },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: 'status', title: 'Statut', type: 'string', options: { list: ['available', 'few', 'sold', 'free'] } }),
    defineField({
      name: 'audience', title: 'Public (catégories, pour filtrer les ateliers)', type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['enfants', 'ados', 'adultes', 'quartier'] },
    }),
    defineField({ name: 'venue', title: 'Lieu', type: 'string' }),
    defineField({ name: 'time', title: 'Horaire (texte libre)', type: 'string' }),
    defineField({ name: 'price', title: 'Prix / mention', type: 'string' }),
    defineField({ name: 'who', title: 'Public (texte libre, ex: "8-12 ans")', type: 'string' }),
    defineField({ name: 'desc', title: 'Description', type: 'text' }),
    defineField({ name: 'image', title: 'Image', type: 'image' }),
    defineField({ name: 'cardColor', title: 'Couleur de la carte', type: 'string' }),
    defineField({ name: 'cardTextColor', title: 'Couleur du texte de la carte', type: 'string' }),
    defineField({ name: 'spectacle', title: 'Spectacle lié', type: 'reference', to: [{ type: 'spectacle' }] }),
    defineField({
      name: 'residenceLink', title: 'Lien vers la page de la compagnie accueillie', type: 'url',
      hidden: ({ document }) => !(document?.type as string[] | undefined)?.includes('résidence'),
    }),

    defineField({
      name: 'dateGroup', title: 'Date (rendez-vous ponctuel)', type: 'object',
      fields: [
        { name: 'day', title: 'Jour (ex: "20" ou "20-24")', type: 'string' },
        { name: 'month', title: 'Mois (ex: "Juil")', type: 'string' },
        { name: 'year', title: 'Année', type: 'string' },
      ],
      hidden: ({ document }) => !!(document?.ponctualDates as string[] | undefined)?.length,
    }),
    defineField({
      name: 'ponctualDates', title: 'Dates ponctuelles (atelier) — cocher les jours sur le calendrier', type: 'array',
      of: [{ type: 'string' }],
      components: { input: MultiDateCalendarInput },
      hidden: ({ document }) => !(document?.type as string[] | undefined)?.includes('atelier'),
      description: 'Pour un atelier avec plusieurs dates ponctuelles (pas de récurrence régulière) : coche chaque date sur le calendrier plutôt que de remplir "Date" ci-dessus.',
    }),
    defineField({
      name: 'recurrence', title: 'Récurrence', type: 'string',
      options: { list: ['ponctuel', 'hebdomadaire', 'mensuel'] },
      initialValue: 'ponctuel',
    }),
    defineField({ name: 'recurrenceDay', title: 'Jour de la semaine', type: 'string', options: { list: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] } }),
    defineField({ name: 'recurrenceWeekOfMonth', title: 'Quelle occurrence du mois (mensuel)', type: 'string', options: { list: ['1', '2', '3', '4', 'dernier'] } }),
    defineField({ name: 'recurrenceTime', title: 'Heure de la récurrence', type: 'string' }),
    defineField({ name: 'recurrenceStart', title: 'Début de la récurrence', type: 'date' }),
    defineField({ name: 'recurrenceEnd', title: 'Fin de la récurrence (optionnel)', type: 'date' }),
  ],
  preview: {
    select: { title: 'title', type0: 'type.0', media: 'image' },
    prepare({ title, type0, media }) {
      return { title, subtitle: type0, media };
    },
  },
});
