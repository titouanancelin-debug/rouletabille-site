// Portable Text limité : gras/italique/liens/listes/titres H2-H4, comme
// l'ancien toolbarOverride de Tina.
export const richTextField = {
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Titre H2', value: 'h2' },
        { title: 'Titre H3', value: 'h3' },
        { title: 'Titre H4', value: 'h4' },
      ],
      lists: [{ title: 'Puces', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Lien',
            fields: [{ name: 'href', type: 'url', title: 'URL' }],
          },
        ],
      },
    },
  ],
};
