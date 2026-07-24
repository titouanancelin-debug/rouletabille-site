import { defineField, defineType } from 'sanity';

export const newsletter = defineType({
  name: 'newsletter',
  title: 'Newsletter',
  type: 'document',
  fields: [
    defineField({ name: 'titleLine1', title: 'Titre — ligne 1', type: 'string' }),
    defineField({ name: 'titleLine2', title: 'Titre — ligne 2', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
  ],
});
