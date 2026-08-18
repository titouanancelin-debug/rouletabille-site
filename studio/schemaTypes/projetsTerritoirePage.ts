import { defineField, defineType } from 'sanity';
import { pageHeaderFields } from './pageSections';

// Page "Projets de territoire" dans Archives : regroupe par projet des
// articles déjà migrés depuis le blog Overblog (voir archiveArticle), plutôt
// que de dupliquer leur contenu — la page affiche le texte/images d'origine
// en les allant chercher par référence, donc toujours synchronisée si un
// article d'archive est corrigé.
export const projetsTerritoirePage = defineType({
  name: 'projetsTerritoirePage',
  title: 'Page Projets de territoire',
  type: 'document',
  fields: [
    ...pageHeaderFields,
    defineField({
      name: 'projects',
      title: 'Projets',
      type: 'array',
      description: 'Ordre = ordre d\'affichage (glisser-déposer pour réordonner).',
      of: [{
        type: 'object',
        name: 'territoryProject',
        fields: [
          defineField({ name: 'title', title: 'Titre du projet', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'description', title: 'Chapô / présentation du projet', type: 'text' }),
          defineField({
            name: 'articles',
            title: 'Articles d\'archive repris pour ce projet',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'archiveArticle' }] }],
          }),
        ],
        preview: {
          select: { title: 'title', articles: 'articles' },
          prepare({ title, articles }) {
            return { title, subtitle: `${(articles || []).length} article(s)` };
          },
        },
      }],
    }),
  ],
});
