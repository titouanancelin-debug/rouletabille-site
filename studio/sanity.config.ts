import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

const SINGLETONS = [
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
];

const structure = (S: any) =>
  S.list()
    .title('Contenu')
    .items([
      // L'agenda en premier : c'est le point d'entrée principal pour l'équipe.
      S.listItem().title('Agenda').schemaType('agenda').child(S.documentTypeList('agenda').title('Agenda')),
      S.divider(),
      S.listItem().title('Spectacles').schemaType('spectacle').child(S.documentTypeList('spectacle').title('Spectacles')),
      S.listItem().title('Équipe').schemaType('equipeMember').child(S.documentTypeList('equipeMember').title('Équipe')),
      S.listItem().title('Partenaires').schemaType('partenaire').child(S.documentTypeList('partenaire').title('Partenaires')),
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

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool({ structure })],

  schema: {
    types: schemaTypes,
  },
});
