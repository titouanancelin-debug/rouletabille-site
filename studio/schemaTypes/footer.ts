import { defineField, defineType } from 'sanity';

export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({ name: 'colDecouvrirTitle', title: 'Titre colonne "Découvrir"', type: 'string' }),
    defineField({ name: 'colPratiqueTitle', title: 'Titre colonne "Pratique"', type: 'string' }),
    defineField({ name: 'colSuivreTitle', title: 'Titre colonne "Suivre"', type: 'string' }),
    defineField({ name: 'linkVenirAtelier', title: 'Libellé lien "Venir à l\'atelier"', type: 'string' }),
    defineField({ name: 'linkDossiersPresse', title: 'Libellé lien "Dossiers de presse"', type: 'string' }),
    defineField({ name: 'linkMentionsLegales', title: 'Libellé lien "Mentions légales"', type: 'string' }),
    defineField({ name: 'linkNewsletter', title: 'Libellé lien "Newsletter"', type: 'string' }),
    defineField({ name: 'copyright', title: 'Copyright', type: 'string' }),
    defineField({ name: 'seasonLabel', title: 'Label saison', type: 'string' }),
  ],
});
