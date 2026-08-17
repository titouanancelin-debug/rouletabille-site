import { defineField, defineType } from 'sanity';

export const spectacle = defineType({
  name: 'spectacle',
  title: 'Spectacle',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'num', title: 'Numéro (affichage)', type: 'string' }),
    defineField({ name: 'tag', title: 'Étiquette (ex: genre)', type: 'string' }),
    defineField({ name: 'date', title: 'Date / saison (texte libre)', type: 'string' }),
    defineField({ name: 'duration', title: 'Durée', type: 'string' }),
    defineField({ name: 'ages', title: 'Âges', type: 'string' }),
    defineField({ name: 'auteur', title: 'Auteur', type: 'string' }),
    defineField({ name: 'mes', title: 'Mise en scène', type: 'string' }),
    defineField({ name: 'with', title: 'Avec (distribution)', type: 'string' }),
    defineField({ name: 'desc', title: 'Description', type: 'text' }),
    defineField({ name: 'dossier', title: 'Dossier du spectacle (PDF)', type: 'file' }),
    defineField({ name: 'image', title: 'Image', type: 'image' }),
    defineField({ name: 'color', title: 'Couleur de fond (affiche)', type: 'string' }),
    defineField({ name: 'textColor', title: 'Couleur du texte (affiche)', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'tag', media: 'image' } },
});
