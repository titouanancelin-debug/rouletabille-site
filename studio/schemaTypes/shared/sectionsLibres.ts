import { defineField, defineType } from 'sanity';
import { richTextField } from './richText';

const TAILLE_TITRE = ['moyen', 'grand', 'enorme'];
const TAILLE_TEXTE = ['petit', 'normal', 'grand', 'tresGrand'];
const ALIGNEMENT = ['gauche', 'centre', 'droite'];
const LARGEUR_IMAGE = ['petite', 'moyenne', 'pleine'];
const HAUTEUR_ESPACE = ['petit', 'moyen', 'grand'];

// Couleur en texte libre (pas un color picker) : les valeurs existantes sont
// souvent des variables CSS ("var(--terra)"), pas des couleurs "pures".
const couleurField = (name: string, title: string) =>
  defineField({ name, title, type: 'string', description: 'Couleur CSS ou variable, ex: var(--terra)' });

export const titreBlock = defineType({
  name: 'titreBlock',
  title: 'Titre',
  type: 'object',
  fields: [
    defineField({ name: 'texte', title: 'Texte', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'taille', title: 'Taille', type: 'string', options: { list: TAILLE_TITRE } }),
    couleurField('couleur', 'Couleur'),
    defineField({ name: 'alignement', title: 'Alignement', type: 'string', options: { list: ALIGNEMENT } }),
  ],
  preview: { select: { title: 'texte' } },
});

export const texteBlock = defineType({
  name: 'texteBlock',
  title: 'Texte',
  type: 'object',
  fields: [
    defineField({ name: 'corps', title: 'Corps', ...richTextField }),
    defineField({ name: 'taille', title: 'Taille', type: 'string', options: { list: TAILLE_TEXTE } }),
    couleurField('couleur', 'Couleur'),
    defineField({ name: 'alignement', title: 'Alignement', type: 'string', options: { list: ALIGNEMENT } }),
    defineField({ name: 'largeur', title: 'Largeur', description: 'Moyenne = colonne de lecture (760px). Pleine = occupe toute la largeur de la section.', type: 'string', options: { list: LARGEUR_IMAGE } }),
  ],
  preview: { select: { title: 'corps.0.children.0.text' } },
});

export const imageBloc = defineType({
  name: 'imageBloc',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'image' }),
    defineField({ name: 'legende', title: 'Légende', type: 'string' }),
    defineField({ name: 'largeur', title: 'Largeur', type: 'string', options: { list: LARGEUR_IMAGE } }),
  ],
  preview: { select: { title: 'legende', media: 'image' } },
});

export const imageTexteBlock = defineType({
  name: 'imageTexteBlock',
  title: 'Image + texte',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'image' }),
    defineField({ name: 'corps', title: 'Corps', ...richTextField }),
    defineField({ name: 'positionImage', title: 'Position de l\'image', type: 'string', options: { list: ['gauche', 'droite'] } }),
    couleurField('couleurFond', 'Couleur de fond'),
    couleurField('couleurTexte', 'Couleur du texte'),
  ],
  preview: { select: { media: 'image', title: 'corps.0.children.0.text' } },
});

export const encartBlock = defineType({
  name: 'encartBlock',
  title: 'Encart',
  type: 'object',
  fields: [
    defineField({ name: 'corps', title: 'Corps', ...richTextField }),
    couleurField('couleurFond', 'Couleur de fond'),
    couleurField('couleurTexte', 'Couleur du texte'),
    defineField({ name: 'taille', title: 'Taille du texte', type: 'string', options: { list: TAILLE_TEXTE } }),
    defineField({ name: 'largeur', title: 'Largeur', type: 'string', options: { list: LARGEUR_IMAGE } }),
  ],
  preview: { select: { title: 'corps.0.children.0.text' } },
});

export const citationBlock = defineType({
  name: 'citationBlock',
  title: 'Citation',
  type: 'object',
  fields: [
    defineField({ name: 'texte', title: 'Texte', type: 'text', validation: (Rule) => Rule.required() }),
    defineField({ name: 'auteur', title: 'Auteur', type: 'string' }),
    defineField({ name: 'style', title: 'Style', type: 'string', options: { list: ['normal', 'manuscrit'] } }),
  ],
  preview: { select: { title: 'texte', subtitle: 'auteur' } },
});

export const espaceBlock = defineType({
  name: 'espaceBlock',
  title: 'Espace',
  type: 'object',
  fields: [
    defineField({ name: 'hauteur', title: 'Hauteur', type: 'string', options: { list: HAUTEUR_ESPACE } }),
  ],
  preview: { select: { title: 'hauteur' } },
});

export const sectionsLibresBlockTypes = [
  { type: 'titreBlock' },
  { type: 'texteBlock' },
  { type: 'imageBloc' },
  { type: 'imageTexteBlock' },
  { type: 'encartBlock' },
  { type: 'citationBlock' },
  { type: 'espaceBlock' },
];

export const sectionsLibresField = (name: string, title: string) =>
  defineField({ name, title, type: 'array', of: sectionsLibresBlockTypes });
