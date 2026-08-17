import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from './schemaTypes';

const SINGLETONS = [
  ['menu', 'Menu'],
  ['siteSettings', 'Réglages du site'],
  ['home', 'Accueil'],
  ['contact', 'Contact'],
  ['presse', 'Presse'],
  ['mentionsLegales', 'Mentions légales'],
  ['footer', 'Footer'],
  ['newsletter', 'Newsletter'],
  ['agendaPage', 'Page Agenda (sections)'],
  ['spectaclesPage', 'Page Spectacles (sections)'],
  ['equipePage', 'Page Équipe (sections)'],
  ['partenairesPage', 'Page Partenaires (sections)'],
  ['ateliersPage', 'Page Ateliers (sections)'],
  ['archivesPage', 'Page Archives (sections)'],
];

// Équipe : trois listes triables par glisser-déposer (une par catégorie),
// plutôt qu'une seule liste plate — l'ordre voulu par la compagnie diffère
// entre permanents, artistes associé·es et conseil d'administration.
const equipeStructure = (S: any, context: any) =>
  S.listItem()
    .title('Équipe')
    .schemaType('equipeMember')
    .child(
      S.list()
        .title('Équipe')
        .items([
          orderableDocumentListDeskItem({
            type: 'equipeMember', id: 'equipe-permanente', title: 'Permanente',
            filter: 'categorie == "permanente"', S, context,
          }),
          orderableDocumentListDeskItem({
            type: 'equipeMember', id: 'equipe-associee', title: 'Artistes associé·es',
            filter: 'categorie == "associee"', S, context,
          }),
          orderableDocumentListDeskItem({
            type: 'equipeMember', id: 'equipe-conseil', title: 'Conseil d\'administration',
            filter: 'categorie == "conseil_administration"', S, context,
          }),
        ])
    );

// Partenaires : une liste triable par glisser-déposer par catégorie (même
// principe que l'équipe) — l'ordre d'affichage voulu diffère d'une catégorie
// à l'autre et n'a rien à voir avec l'ordre de création des fiches.
const partenairesStructure = (S: any, context: any) =>
  S.listItem()
    .title('Partenaires')
    .schemaType('partenaire')
    .child(
      S.list()
        .title('Partenaires')
        .items([
          orderableDocumentListDeskItem({
            type: 'partenaire', id: 'partenaires-territoire', title: 'Action culturelle & territoire',
            filter: 'type == "Action culturelle & territoire"', S, context,
          }),
          orderableDocumentListDeskItem({
            type: 'partenaire', id: 'partenaires-artistiques', title: 'Partenaires artistiques',
            filter: 'type == "Partenaires artistiques"', S, context,
          }),
          orderableDocumentListDeskItem({
            type: 'partenaire', id: 'partenaires-institutionnel', title: 'Soutien institutionnel',
            filter: 'type == "Soutien institutionnel"', S, context,
          }),
          orderableDocumentListDeskItem({
            type: 'partenaire', id: 'partenaires-education', title: 'Éducation',
            filter: 'type == "Éducation"', S, context,
          }),
        ])
    );

const structure = (S: any, context: any) =>
  S.list()
    .title('Contenu')
    .items([
      // L'agenda en premier : c'est le point d'entrée principal pour l'équipe.
      S.listItem().title('Agenda').schemaType('agenda').child(S.documentTypeList('agenda').title('Agenda')),
      S.divider(),
      S.listItem().title('Spectacles').schemaType('spectacle').child(S.documentTypeList('spectacle').title('Spectacles')),
      equipeStructure(S, context),
      partenairesStructure(S, context),
      S.listItem().title('Archives').schemaType('archiveArticle').child(S.documentTypeList('archiveArticle').title('Archives')),
      S.divider(),
      ...SINGLETONS.map(([name, title]) =>
        S.listItem().title(title).id(name).child(
          S.document().schemaType(name).documentId(name)
        )
      ),
    ]);

export default defineConfig({
  name: 'default',
  title: 'Cie Rouletabille',

  projectId: 'bg0qr5k4',
  dataset: 'production',

  plugins: [structureTool({ structure })],

  schema: {
    types: schemaTypes,
  },
});
