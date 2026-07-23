import { defineConfig } from "tinacms";

// Branche déployée en production sur Cloudflare Pages — à changer ici si vous
// basculez vers "main" (même logique que l'ancien public/admin/config.yml de Decap).
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.HEAD ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  "claude/installed-skills-overview-j4il8o";

// Barre d'outils des champs texte riche : gras, italique, liens, listes +
// niveaux de titre (H2/H3/H4 = trois tailles prédéfinies dans styles.css).
const richText = (name: string, label: string, required = false) => ({
  type: "rich-text" as const,
  name,
  label,
  required,
  toolbarOverride: [
    "heading", "bold", "italic", "link", "ul", "ol", "quote",
  ],
});

const alignementField = {
  type: "string" as const,
  name: "alignement",
  label: "Alignement",
  required: false,
  options: [
    { value: "gauche", label: "À gauche" },
    { value: "centre", label: "Centré" },
    { value: "droite", label: "À droite" },
  ],
};

// Zone "sections libres" : blocs que l'équipe peut ajouter, réordonner et
// supprimer depuis l'admin Tina, avec réglages de taille/couleur par bloc.
// Fabrique de champ pour pouvoir poser plusieurs zones à différents endroits
// d'une même page (haut / bas) plutôt qu'une seule zone figée en bas.
const sectionsLibresField = (name: string, label: string) => ({
  type: "object" as const,
  name,
  label,
  list: true,
  templates: [
    {
      name: "titre",
      label: "Titre",
      ui: { itemProps: (item) => ({ label: `Titre — ${item?.texte || ""}` }) },
      fields: [
        { type: "string" as const, name: "texte", label: "Texte du titre" },
        {
          type: "string" as const, name: "taille", label: "Taille", required: false,
          options: [
            { value: "moyen", label: "Moyen" },
            { value: "grand", label: "Grand" },
            { value: "enorme", label: "Énorme" },
          ],
        },
        { type: "string" as const, name: "couleur", label: "Couleur du texte", required: false, ui: { component: "color" } },
        alignementField,
      ],
    },
    {
      name: "texte",
      label: "Texte",
      fields: [
        richText("corps", "Texte"),
        {
          type: "string" as const, name: "taille", label: "Taille du texte", required: false,
          options: [
            { value: "petit", label: "Petit" },
            { value: "normal", label: "Normal" },
            { value: "grand", label: "Grand" },
            { value: "tresGrand", label: "Très grand" },
          ],
        },
        { type: "string" as const, name: "couleur", label: "Couleur du texte", required: false, ui: { component: "color" } },
        alignementField,
      ],
    },
    {
      name: "image",
      label: "Image",
      fields: [
        { type: "image" as const, name: "image", label: "Image" },
        { type: "string" as const, name: "legende", label: "Légende (optionnel)", required: false },
        {
          type: "string" as const, name: "largeur", label: "Largeur", required: false,
          options: [
            { value: "petite", label: "Petite" },
            { value: "moyenne", label: "Moyenne" },
            { value: "pleine", label: "Pleine largeur" },
          ],
        },
      ],
    },
    {
      name: "imageTexte",
      label: "Image + texte",
      fields: [
        { type: "image" as const, name: "image", label: "Image" },
        richText("corps", "Texte"),
        {
          type: "string" as const, name: "positionImage", label: "Position de l'image", required: false,
          options: [
            { value: "gauche", label: "À gauche du texte" },
            { value: "droite", label: "À droite du texte" },
          ],
        },
        { type: "string" as const, name: "couleurFond", label: "Couleur de fond", required: false, ui: { component: "color" } },
        { type: "string" as const, name: "couleurTexte", label: "Couleur du texte", required: false, ui: { component: "color" } },
      ],
    },
    {
      name: "encart",
      label: "Encart coloré",
      fields: [
        richText("corps", "Texte"),
        {
          type: "string" as const, name: "taille", label: "Taille du texte", required: false,
          options: [
            { value: "petit", label: "Petit" },
            { value: "normal", label: "Normal" },
            { value: "grand", label: "Grand" },
            { value: "tresGrand", label: "Très grand" },
          ],
        },
        {
          type: "string" as const, name: "largeur", label: "Largeur du bloc", required: false,
          options: [
            { value: "petite", label: "Petite" },
            { value: "moyenne", label: "Moyenne" },
            { value: "pleine", label: "Pleine largeur" },
          ],
        },
        { type: "string" as const, name: "couleurFond", label: "Couleur de fond", required: false, ui: { component: "color" } },
        { type: "string" as const, name: "couleurTexte", label: "Couleur du texte", required: false, ui: { component: "color" } },
      ],
    },
    {
      name: "citation",
      label: "Citation",
      fields: [
        { type: "string" as const, name: "texte", label: "Citation", ui: { component: "textarea" } },
        { type: "string" as const, name: "auteur", label: "Auteur (optionnel)", required: false },
        {
          type: "string" as const, name: "style", label: "Style", required: false,
          options: [
            { value: "elegant", label: "Élégant (serif italique)" },
            { value: "manuscrit", label: "Manuscrit" },
          ],
        },
      ],
    },
    {
      name: "espace",
      label: "Espace vide",
      fields: [
        {
          type: "string" as const, name: "hauteur", label: "Hauteur", required: false,
          options: [
            { value: "petit", label: "Petit" },
            { value: "moyen", label: "Moyen" },
            { value: "grand", label: "Grand" },
          ],
        },
      ],
    },
  ],
});

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "images/uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "spectacles",
        label: "Spectacles",
        path: "content",
        format: "json",
        match: { include: "spectacles" },
        ui: { global: true, router: () => "/spectacles" },
        fields: [
          sectionsLibresField("sectionsHaut", "Sections libres (haut de page)"),
          {
            type: "object",
            name: "spectacles",
            label: "Spectacles",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || "Spectacle" }) },
            fields: [
              { type: "string", name: "id", label: "Identifiant (unique, sans espace)" },
              { type: "image", name: "image", label: "Photo (optionnel — sinon l'affiche générée s'affiche)" },
              { type: "string", name: "num", label: "Numéro" },
              { type: "string", name: "title", label: "Titre" },
              { type: "string", name: "tag", label: "Catégorie" },
              { type: "string", name: "date", label: "Date" },
              { type: "string", name: "duration", label: "Durée" },
              { type: "string", name: "ages", label: "Âge conseillé" },
              { type: "string", name: "color", label: "Couleur fond", ui: { component: "color" } },
              { type: "string", name: "textColor", label: "Couleur texte", ui: { component: "color" } },
              richText("desc", "Description"),
              { type: "string", name: "auteur", label: "Auteur" },
              { type: "string", name: "mes", label: "Mise en scène" },
              { type: "string", name: "with", label: "Avec (interprètes)" },
            ],
          },
          sectionsLibresField("sections", "Sections libres (bas de page)"),
        ],
      },
      {
        name: "agenda",
        label: "Agenda",
        path: "content",
        format: "json",
        match: { include: "agenda" },
        ui: { global: true, router: () => "/agenda" },
        fields: [
          sectionsLibresField("sectionsHaut", "Sections libres (haut de page)"),
          {
            type: "object",
            name: "agenda",
            label: "Dates",
            list: true,
            ui: { itemProps: (item) => ({ label: `${item?.title || "Date"} — ${item?.day}/${item?.month}/${item?.year}` }) },
            fields: [
              { type: "image", name: "image", label: "Photo (optionnel — sinon la carte générée s'affiche)" },
              { type: "string", name: "day", label: "Jour (laisser vide si récurrent — voir Fréquence plus bas)", required: false },
              { type: "string", name: "month", label: "Mois - 3 lettres (laisser vide si récurrent)", required: false },
              { type: "string", name: "year", label: "Année (laisser vide si récurrent)", required: false },
              { type: "string", name: "title", label: "Titre" },
              { type: "string", name: "venue", label: "Lieu" },
              { type: "string", name: "time", label: "Horaire / détail" },
              { type: "string", name: "who", label: "Public (texte libre, ex: '8-12 ans' — surtout utile pour un atelier)", required: false },
              { type: "string", name: "audience", label: "Public cible (filtre de la page Ateliers)", options: ["enfants", "ados", "adultes", "quartier"], required: false },
              { type: "string", name: "price", label: "Prix" },
              { type: "string", name: "status", label: "Statut", options: ["free", "available"] },
              {
                type: "string", name: "type", label: "Type(s) — un rendez-vous peut cocher plusieurs cases",
                list: true,
                options: ["résidence", "événement", "spectacle", "atelier", "médiation"],
              },
              richText("desc", "Description"),
              { type: "string", name: "cardColor", label: "Couleur carte", ui: { component: "color" } },
              { type: "string", name: "cardTextColor", label: "Couleur texte carte", ui: { component: "color" } },
              { type: "string", name: "spectacle", label: "Spectacle lié (identifiant, optionnel)", required: false },
              {
                type: "string",
                name: "recurrence",
                label: "Fréquence",
                options: [
                  { value: "ponctuel", label: "Ponctuel (utiliser la date Jour/Mois/Année ci-dessus)" },
                  { value: "hebdomadaire", label: "Chaque semaine" },
                  { value: "mensuel", label: "Une fois par mois" },
                ],
                required: false,
              },
              {
                type: "string",
                name: "recurrenceDay",
                label: "Jour de la semaine",
                options: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
                required: false,
              },
              {
                type: "string",
                name: "recurrenceWeekOfMonth",
                label: "Quelle semaine du mois (fréquence mensuelle uniquement)",
                options: [
                  { value: "1", label: "1ère semaine" },
                  { value: "2", label: "2e semaine" },
                  { value: "3", label: "3e semaine" },
                  { value: "4", label: "4e semaine" },
                  { value: "dernier", label: "Dernière semaine du mois" },
                ],
                required: false,
              },
              { type: "string", name: "recurrenceStart", label: "Date de début (format AAAA-MM-JJ, ex: 2026-09-03)", required: false },
              { type: "string", name: "recurrenceEnd", label: "Date de fin (format AAAA-MM-JJ, optionnel — sinon généré jusqu'à 12 mois)", required: false },
              { type: "string", name: "recurrenceTime", label: "Horaire à afficher dans l'agenda (ex: 17h30–19h)", required: false },
            ],
          },
          sectionsLibresField("sections", "Sections libres (bas de page)"),
        ],
      },
      {
        name: "ateliers",
        label: "Page Ateliers",
        path: "content",
        format: "json",
        match: { include: "ateliers" },
        ui: { global: true, router: () => "/ateliers" },
        fields: [
          sectionsLibresField("sectionsHaut", "Sections libres (haut de page)"),
          // Champ technique conservé tel quel (même structure qu'avant le 22/07/2026) pour que
          // TinaCloud ne voie pas la suppression du type "AteliersAteliers" comme un changement
          // de schéma "breaking" — ça bloquait l'indexation TinaCloud sur cette branche. Les
          // ateliers sont gérés depuis l'agenda ; ce champ ne doit plus être rempli.
          {
            type: "object",
            name: "ateliers",
            label: "(Ne plus utiliser — les ateliers se gèrent depuis l'Agenda)",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || "Atelier" }) },
            fields: [
              { type: "image", name: "image", label: "Photo (optionnel — sinon la carte de couleur s'affiche)" },
              { type: "string", name: "num", label: "Numéro" },
              { type: "string", name: "title", label: "Titre" },
              { type: "string", name: "who", label: "Public" },
              { type: "string", name: "when", label: "Horaires" },
              { type: "string", name: "where", label: "Lieu" },
              { type: "string", name: "price", label: "Prix" },
              { type: "string", name: "color", label: "Couleur fond", ui: { component: "color" } },
              { type: "string", name: "textColor", label: "Couleur texte", ui: { component: "color" } },
              richText("desc", "Description"),
              { type: "string", name: "audience", label: "Public cible", options: ["enfants", "ados", "adultes", "quartier"] },
              {
                type: "string",
                name: "recurrence",
                label: "Fréquence",
                options: [
                  { value: "ponctuel", label: "Ponctuel (pas de date récurrente dans l'agenda)" },
                  { value: "hebdomadaire", label: "Chaque semaine" },
                  { value: "mensuel", label: "Une fois par mois" },
                ],
              },
              {
                type: "string",
                name: "recurrenceDay",
                label: "Jour de la semaine",
                options: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
                required: false,
              },
              {
                type: "string",
                name: "recurrenceWeekOfMonth",
                label: "Quelle semaine du mois (fréquence mensuelle uniquement)",
                options: [
                  { value: "1", label: "1ère semaine" },
                  { value: "2", label: "2e semaine" },
                  { value: "3", label: "3e semaine" },
                  { value: "4", label: "4e semaine" },
                  { value: "dernier", label: "Dernière semaine du mois" },
                ],
                required: false,
              },
              { type: "string", name: "recurrenceStart", label: "Date de début (format AAAA-MM-JJ, ex: 2026-09-03)", required: false },
              { type: "string", name: "recurrenceEnd", label: "Date de fin (format AAAA-MM-JJ, optionnel — sinon généré jusqu'à 12 mois)", required: false },
              { type: "string", name: "recurrenceTime", label: "Horaire à afficher dans l'agenda (ex: 17h30–19h)", required: false },
            ],
          },
          sectionsLibresField("sections", "Sections libres (bas de page)"),
        ],
      },
      {
        name: "equipe",
        label: "Équipe",
        path: "content",
        format: "json",
        match: { include: "equipe" },
        ui: { global: true, router: () => "/equipe" },
        fields: [
          sectionsLibresField("sectionsHaut", "Sections libres (haut de page)"),
          {
            type: "object",
            name: "equipe",
            label: "Membres",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.name || "Membre" }) },
            fields: [
              { type: "image", name: "image", label: "Photo (optionnel — sinon le portrait généré s'affiche)" },
              { type: "string", name: "name", label: "Nom" },
              { type: "string", name: "role", label: "Rôle" },
              {
                type: "string",
                name: "categorie",
                label: "Catégorie",
                options: [
                  { value: "permanente", label: "Équipe permanente" },
                  { value: "associee", label: "Artiste associé·e" },
                  { value: "conseil_administration", label: "Membre fondateur / Conseil d'administration" },
                ],
              },
              richText("bio", "Bio"),
              { type: "string", name: "quote", label: "Citation (optionnel)", required: false },
            ],
          },
          sectionsLibresField("sections", "Sections libres (bas de page)"),
        ],
      },
      {
        name: "partenaires",
        label: "Partenaires",
        path: "content",
        format: "json",
        match: { include: "partenaires" },
        ui: { global: true, router: () => "/partenaires" },
        fields: [
          sectionsLibresField("sectionsHaut", "Sections libres (haut de page)"),
          {
            type: "object",
            name: "partenaires",
            label: "Partenaires",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.name || "Partenaire" }) },
            fields: [
              { type: "image", name: "image", label: "Logo (optionnel — sinon les initiales s'affichent)" },
              { type: "string", name: "name", label: "Nom" },
              {
                type: "string",
                name: "type",
                label: "Type",
                options: [
                  "Soutien institutionnel",
                  "Partenaires artistiques",
                  "Action culturelle & territoire",
                  "Éducation",
                  "Autres soutiens",
                ],
              },
              { type: "string", name: "url", label: "Site web (optionnel)", required: false },
            ],
          },
          sectionsLibresField("sections", "Sections libres (bas de page)"),
        ],
      },
      {
        name: "home",
        label: "Page d'accueil",
        path: "content",
        format: "json",
        match: { include: "home" },
        ui: { global: true, router: () => "/" },
        fields: [
          {
            type: "object",
            name: "home",
            label: "Accueil",
            fields: [
              { type: "string", name: "heroEyebrow", label: "Bandeau saison" },
              { type: "string", name: "heroLine1", label: "Titre hero — ligne 1" },
              { type: "string", name: "heroLine2", label: "Titre hero — ligne 2" },
              richText("heroIntro", "Intro hero"),
              { type: "string", name: "heroTagline", label: "Accroche fondation" },
              sectionsLibresField("sectionsHaut", "Sections libres (juste après le hero)"),
              {
                type: "object",
                name: "histoire",
                label: "Histoire d'un projet",
                list: true,
                ui: { itemProps: (item) => ({ label: item?.label || "Section" }) },
                fields: [
                  { type: "string", name: "label", label: "Titre de la section" },
                  { type: "string", name: "teaser", label: "Résumé (accordéon fermé)", ui: { component: "textarea" } },
                  richText("texte", "Texte (accordéon ouvert)"),
                ],
              },
              { type: "string", name: "aboutTag", label: "À propos — mention" },
              { type: "string", name: "aboutTitle", label: "À propos — titre" },
              richText("aboutTexte", "À propos — texte"),
              richText("publicsIntro", "Publics — texte d'intro"),
              sectionsLibresField("sections", "Sections libres (bas de page)"),
            ],
          },
        ],
      },
      {
        name: "contact",
        label: "Page Contact",
        path: "content",
        format: "json",
        match: { include: "contact" },
        ui: { global: true, router: () => "/contact" },
        fields: [
          {
            type: "object",
            name: "contact",
            label: "Contact",
            fields: [
              richText("meta", "Texte d'intro"),
              sectionsLibresField("sectionsHaut", "Sections libres (haut de page)"),
              { type: "string", name: "addressName", label: "Nom (adresse)" },
              { type: "string", name: "addressLine1", label: "Adresse — ligne 1" },
              { type: "string", name: "addressLine2", label: "Adresse — ligne 2" },
              { type: "string", name: "email", label: "Email" },
              { type: "string", name: "website", label: "Site web" },
              { type: "string", name: "phone1", label: "Téléphone 1" },
              { type: "string", name: "phone2", label: "Téléphone 2" },
              { type: "string", name: "hours", label: "Horaires" },
              { type: "string", name: "access", label: "Accès (une ligne par moyen de transport)", list: true },
              sectionsLibresField("sections", "Sections libres (bas de page)"),
            ],
          },
        ],
      },
      {
        name: "mentionsLegales",
        label: "Mentions légales",
        path: "content",
        format: "json",
        match: { include: "mentionsLegales" },
        ui: { global: true, router: () => "/mentions-legales" },
        fields: [
          {
            type: "object",
            name: "mentionsLegales",
            label: "Mentions légales",
            fields: [
              sectionsLibresField("sectionsHaut", "Sections libres (haut de page)"),
              { type: "string", name: "associationName", label: "Nom de l'association" },
              { type: "string", name: "siege", label: "Siège social" },
              { type: "string", name: "siret", label: "SIRET" },
              { type: "string", name: "representante", label: "Représentante légale" },
              { type: "string", name: "contactEmail", label: "Email de contact" },
              { type: "string", name: "hebergeurNom", label: "Hébergeur — nom" },
              { type: "string", name: "hebergeurAdresse", label: "Hébergeur — adresse" },
              { type: "string", name: "hebergeurUrl", label: "Hébergeur — site web" },
              richText("proprieteIntellectuelle", "Propriété intellectuelle — texte"),
              richText("donneesPersonnelles", "Données personnelles — texte"),
              richText("cookies", "Cookies et traceurs — texte"),
              sectionsLibresField("sections", "Sections libres (bas de page)"),
            ],
          },
        ],
      },
      // Collection technique conservée telle quelle (même structure qu'avant le 22/07/2026) pour
      // que TinaCloud ne voie pas la suppression du type "MenuMenu" comme un changement de schéma
      // "breaking" — ça bloquait l'indexation TinaCloud sur cette branche. Le menu reste géré en
      // statique dans content/menu.json ; ce champ ne doit plus être rempli.
      {
        name: "menu",
        label: "(Ne plus utiliser — le menu n'est plus édité depuis Tina)",
        path: "content",
        format: "json",
        match: { include: "menu" },
        ui: { global: true, router: () => "/" },
        fields: [
          {
            type: "object",
            name: "menu",
            label: "Menu",
            fields: [
              { type: "string", name: "labelHome", label: "Lien — Accueil" },
              { type: "string", name: "labelSpectacles", label: "Lien — Notre travail" },
              { type: "string", name: "labelAgenda", label: "Lien — Agenda" },
              { type: "string", name: "labelEquipe", label: "Lien — Équipe" },
              { type: "string", name: "labelPartenaires", label: "Lien — Partenaires" },
              { type: "string", name: "labelContact", label: "Lien — Contact" },
            ],
          },
        ],
      },
      {
        name: "presse",
        label: "Page Presse",
        path: "content",
        format: "json",
        match: { include: "presse" },
        ui: { global: true, router: () => "/presse" },
        fields: [
          {
            type: "object",
            name: "presse",
            label: "Presse",
            fields: [
              richText("intro", "Texte de présentation"),
              sectionsLibresField("sectionsHaut", "Sections libres (haut de page)"),
              { type: "string", name: "contactEmail", label: "Email de contact presse" },
              sectionsLibresField("sections", "Sections libres (bas de page)"),
            ],
          },
        ],
      },
      {
        name: "footer",
        label: "Pied de page",
        path: "content",
        format: "json",
        match: { include: "footer" },
        ui: { global: true, router: () => "/" },
        fields: [
          {
            type: "object",
            name: "footer",
            label: "Footer",
            fields: [
              richText("tagline", "Texte de présentation"),
              { type: "string", name: "copyright", label: "Copyright (bas de page)" },
              { type: "string", name: "seasonLabel", label: "Mention saison (bas de page)" },
            ],
          },
        ],
      },
      {
        name: "newsletter",
        label: "Bloc newsletter",
        path: "content",
        format: "json",
        match: { include: "newsletter" },
        ui: { global: true, router: () => "/" },
        fields: [
          {
            type: "object",
            name: "newsletter",
            label: "Newsletter",
            fields: [
              { type: "string", name: "titleLine1", label: "Titre — ligne 1" },
              { type: "string", name: "titleLine2", label: "Titre — ligne 2" },
              richText("description", "Description"),
            ],
          },
        ],
      },
    ],
  },
});
