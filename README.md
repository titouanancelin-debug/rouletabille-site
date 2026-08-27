# Cie Rouletabille — Site web

Site vitrine de la Cie Rouletabille, compagnie de théâtre basée à Périgueux (Dordogne), active depuis 1993.

- **Site en ligne :** https://rtb-9cy.pages.dev
- **Studio d'édition (Sanity) :** https://rouletabille.sanity.studio

## Stack

- **Frontend :** React + Vite, servi statiquement.
- **Hébergement :** Cloudflare Pages, déploiement automatique à chaque push sur `main`.
- **CMS :** [Sanity](https://www.sanity.io/) — tout le contenu éditorial (agenda, spectacles, équipe, partenaires, textes de page, archives) est géré depuis le Studio, sans toucher au code.
- **Formulaires :** Cloudflare Functions + [Resend](https://resend.com/) pour l'envoi d'email.

## Structure du dépôt

```
js/            Site React (composants, routing, logique d'agenda/récurrence/archivage)
css/           Design system (variables, styles globaux)
public/        Assets statiques servis tels quels (favicons, images...)
functions/     Cloudflare Functions (endpoints des formulaires)
studio/        Sanity Studio — l'interface d'édition de contenu (sous-projet séparé)
scripts/       Scripts ponctuels de migration de données (non exécutés en prod)
assets/identite-graphique/   Charte graphique (logos, couleurs, typographie)
```

## Développement local

```bash
npm install
npm run dev      # site (Vite, http://localhost:5173)
npm run build    # build de production
```

Le Studio Sanity a son propre `package.json` dans `studio/` :

```bash
cd studio
npm install
npm run dev       # Studio en local
```

Variables d'environnement nécessaires : voir `.env.example` (site) et `.dev.vars` (Cloudflare Functions, non versionné).
