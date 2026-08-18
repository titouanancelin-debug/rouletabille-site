/* Contenu du site lu depuis Sanity (remplace TinaCMS). Une seule requête
   GROQ au montage ramène tout le contenu ; l'agenda est ensuite étendu avec
   ses occurrences récurrentes (voir recurrence.js). Pas de mode "édition
   visuelle" ici : la page publique lit toujours l'API, l'édition se fait
   dans Sanity Studio (studio/). */
import { createContext, useContext, useEffect, useState } from 'react';
import { sanityClient } from './sanity-client.js';
import { expandRecurrence } from './recurrence.js';

const QUERY = `{
  "spectacles": *[_type == "spectacle"]{
    ..., "id": slug.current, "image": image.asset->url,
    "dossier": {"asset": {"url": dossier.asset->url, "originalFilename": dossier.asset->originalFilename}}
  },
  "spectaclesPage": *[_id == "spectaclesPage"][0],
  "agenda": *[_type == "agenda"]{
    ...,
    "day": dateGroup.day, "month": dateGroup.month, "year": dateGroup.year,
    "spectacle": spectacle->slug.current,
    "image": image.asset->url,
    "dossier": {"asset": {"url": dossier.asset->url, "originalFilename": dossier.asset->originalFilename}}
  },
  "agendaPage": *[_id == "agendaPage"][0],
  "ateliersPage": *[_id == "ateliersPage"][0],
  "equipe": *[_type == "equipeMember"] | order(orderRank asc) {..., "image": image.asset->url},
  "equipePage": *[_id == "equipePage"][0],
  "partenaires": *[_type == "partenaire"] | order(orderRank asc) {..., "image": image.asset->url},
  "partenairesPage": *[_id == "partenairesPage"][0],
  "home": *[_id == "home"][0],
  "contact": *[_id == "contact"][0],
  "mentionsLegales": *[_id == "mentionsLegales"][0],
  "presse": *[_id == "presse"]{..., "pressKit": pressKit[]{..., "file": {"asset": {"url": file.asset->url, "originalFilename": file.asset->originalFilename}}}}[0],
  "footer": *[_id == "footer"][0],
  "newsletter": *[_id == "newsletter"][0],
  "menu": *[_id == "menu"][0],
  "siteSettings": *[_id == "siteSettings"][0],
  "archivesPage": *[_id == "archivesPage"][0],
  "creationsCompagniePage": *[_id == "creationsCompagniePage"][0],
  "projetsTerritoirePage": *[_id == "projetsTerritoirePage"][0]{
    ...,
    projects[]{
      ...,
      articles[]->{title, "slug": slug.current, publishedAt, author, mainImage, body}
    }
  }
}`;

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    sanityClient.fetch(QUERY).then((res) => {
      if (!cancelled) setData(res);
    });
    return () => { cancelled = true; };
  }, []);

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)', opacity: 0.6,
      }}>
        Chargement…
      </div>
    );
  }

  const value = {
    SPECTACLES: data.spectacles,
    SPECTACLES_PAGE: data.spectaclesPage,
    SPECTACLES_SECTIONS: data.spectaclesPage?.sections,
    SPECTACLES_SECTIONS_HAUT: data.spectaclesPage?.sectionsHaut,
    AGENDA: expandRecurrence(data.agenda),
    AGENDA_PAGE: data.agendaPage,
    AGENDA_SECTIONS: data.agendaPage?.sections,
    AGENDA_SECTIONS_HAUT: data.agendaPage?.sectionsHaut,
    ATELIERS_PAGE: data.ateliersPage,
    ATELIERS_SECTIONS: data.ateliersPage?.sections,
    ATELIERS_SECTIONS_HAUT: data.ateliersPage?.sectionsHaut,
    EQUIPE: data.equipe,
    EQUIPE_PAGE: data.equipePage,
    EQUIPE_SECTIONS: data.equipePage?.sections,
    EQUIPE_SECTIONS_HAUT: data.equipePage?.sectionsHaut,
    PARTENAIRES: data.partenaires,
    PARTENAIRES_PAGE: data.partenairesPage,
    PARTENAIRES_SECTIONS: data.partenairesPage?.sections,
    PARTENAIRES_SECTIONS_HAUT: data.partenairesPage?.sectionsHaut,
    HOME: data.home,
    CONTACT: data.contact,
    MENTIONS_LEGALES: data.mentionsLegales,
    PRESSE: data.presse,
    FOOTER: data.footer,
    NEWSLETTER: data.newsletter,
    MENU: data.menu,
    SITE: data.siteSettings,
    ARCHIVES_PAGE: data.archivesPage,
    CREATIONS_COMPAGNIE_PAGE: data.creationsCompagniePage,
    PROJETS_TERRITOIRE_PAGE: data.projetsTerritoirePage,
  };
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent doit être utilisé sous <ContentProvider>');
  return ctx;
}
