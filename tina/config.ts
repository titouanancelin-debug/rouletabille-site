import { defineConfig } from "tinacms";

// Branche déployée en production sur Cloudflare Pages — à changer ici si vous
// basculez vers "main" (même logique que l'ancien public/admin/config.yml de Decap).
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.HEAD ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  "claude/installed-skills-overview-j4il8o";

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
          {
            type: "object",
            name: "spectacles",
            label: "Spectacles",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || "Spectacle" }) },
            fields: [
              { type: "string", name: "id", label: "Identifiant (unique, sans espace)" },
              { type: "string", name: "num", label: "Numéro" },
              { type: "string", name: "title", label: "Titre" },
              { type: "string", name: "tag", label: "Catégorie" },
              { type: "string", name: "date", label: "Date" },
              { type: "string", name: "duration", label: "Durée" },
              { type: "string", name: "ages", label: "Âge conseillé" },
              { type: "string", name: "color", label: "Couleur fond", ui: { component: "color" } },
              { type: "string", name: "textColor", label: "Couleur texte", ui: { component: "color" } },
              { type: "string", name: "desc", label: "Description", ui: { component: "textarea" } },
              { type: "string", name: "auteur", label: "Auteur" },
              { type: "string", name: "mes", label: "Mise en scène" },
              { type: "string", name: "with", label: "Avec (interprètes)" },
            ],
          },
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
          {
            type: "object",
            name: "agenda",
            label: "Dates",
            list: true,
            ui: { itemProps: (item) => ({ label: `${item?.title || "Date"} — ${item?.day}/${item?.month}/${item?.year}` }) },
            fields: [
              { type: "string", name: "day", label: "Jour" },
              { type: "string", name: "month", label: "Mois (3 lettres)" },
              { type: "string", name: "year", label: "Année" },
              { type: "string", name: "title", label: "Titre" },
              { type: "string", name: "venue", label: "Lieu" },
              { type: "string", name: "time", label: "Horaire / détail" },
              { type: "string", name: "price", label: "Prix" },
              { type: "string", name: "status", label: "Statut", options: ["free", "available"] },
              { type: "string", name: "type", label: "Type", options: ["résidence", "événement", "spectacle", "atelier"] },
              { type: "string", name: "cardColor", label: "Couleur carte", ui: { component: "color" } },
              { type: "string", name: "cardTextColor", label: "Couleur texte carte", ui: { component: "color" } },
              { type: "string", name: "spectacle", label: "Spectacle lié (identifiant, optionnel)", required: false },
            ],
          },
        ],
      },
      {
        name: "ateliers",
        label: "Ateliers",
        path: "content",
        format: "json",
        match: { include: "ateliers" },
        ui: { global: true, router: () => "/ateliers" },
        fields: [
          {
            type: "object",
            name: "ateliers",
            label: "Ateliers",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || "Atelier" }) },
            fields: [
              { type: "string", name: "num", label: "Numéro" },
              { type: "string", name: "title", label: "Titre" },
              { type: "string", name: "who", label: "Public" },
              { type: "string", name: "when", label: "Horaires" },
              { type: "string", name: "where", label: "Lieu" },
              { type: "string", name: "price", label: "Prix" },
              { type: "string", name: "color", label: "Couleur fond", ui: { component: "color" } },
              { type: "string", name: "textColor", label: "Couleur texte", ui: { component: "color" } },
              { type: "string", name: "desc", label: "Description", ui: { component: "textarea" } },
              { type: "string", name: "audience", label: "Public cible", options: ["enfants", "ados", "adultes", "quartier"] },
            ],
          },
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
          {
            type: "object",
            name: "equipe",
            label: "Membres",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.name || "Membre" }) },
            fields: [
              { type: "string", name: "name", label: "Nom" },
              { type: "string", name: "role", label: "Rôle" },
              {
                type: "string",
                name: "categorie",
                label: "Catégorie",
                options: [
                  { value: "permanente", label: "Équipe permanente" },
                  { value: "associee", label: "Artiste associé·e" },
                ],
              },
              { type: "string", name: "bio", label: "Bio", ui: { component: "textarea" } },
              { type: "string", name: "quote", label: "Citation (optionnel)", required: false },
            ],
          },
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
          {
            type: "object",
            name: "partenaires",
            label: "Partenaires",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.name || "Partenaire" }) },
            fields: [
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
                ],
              },
              { type: "string", name: "url", label: "Site web (optionnel)", required: false },
            ],
          },
        ],
      },
    ],
  },
});
