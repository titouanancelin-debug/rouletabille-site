/* Contenu du site lu depuis Sanity (remplace TinaCMS). Une seule requête
   GROQ au montage ramène tout le contenu ; l'agenda est ensuite étendu avec
   ses occurrences récurrentes (voir recurrence.js). Pas de mode "édition
   visuelle" ici : la page publique lit toujours l'API, l'édition se fait
   dans Sanity Studio (studio/). */
import { createContext, useContext, useEffect, useState } from 'react';
import { sanityClient } from './sanity-client.js';
import { expandRecurrence } from './recurrence.js';
import menuData from '../content/menu.json';

const QUERY = `{
  "spectacles": *[_type == "spectacle"]{
    ..., "id": slug.current, "image": image.asset->url
  },
  "spectaclesPage": *[_id == "spectaclesPage"][0],
  "agenda": *[_type == "agenda"]{
    ...,
    "day": dateGroup.day, "month": dateGroup.month, "year": dateGroup.year,
    "spectacle": spectacle->slug.current,
    "image": image.asset->url
  },
  "agendaPage": *[_id == "agendaPage"][0],
  "ateliersPage": *[_id == "ateliersPage"][0],
  "equipe": *[_type == "equipeMember"]{..., "image": image.asset->url},
  "equipePage": *[_id == "equipePage"][0],
  "partenaires": *[_type == "partenaire"]{..., "image": image.asset->url},
  "partenairesPage": *[_id == "partenairesPage"][0],
  "home": *[_id == "home"][0],
  "contact": *[_id == "contact"][0],
  "mentionsLegales": *[_id == "mentionsLegales"][0],
  "presse": *[_id == "presse"][0],
  "footer": *[_id == "footer"][0],
  "newsletter": *[_id == "newsletter"][0]
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
    SPECTACLES_SECTIONS: data.spectaclesPage?.sections,
    SPECTACLES_SECTIONS_HAUT: data.spectaclesPage?.sectionsHaut,
    AGENDA: expandRecurrence(data.agenda),
    AGENDA_SECTIONS: data.agendaPage?.sections,
    AGENDA_SECTIONS_HAUT: data.agendaPage?.sectionsHaut,
    ATELIERS_SECTIONS: data.ateliersPage?.sections,
    ATELIERS_SECTIONS_HAUT: data.ateliersPage?.sectionsHaut,
    EQUIPE: data.equipe,
    EQUIPE_SECTIONS: data.equipePage?.sections,
    EQUIPE_SECTIONS_HAUT: data.equipePage?.sectionsHaut,
    PARTENAIRES: data.partenaires,
    PARTENAIRES_SECTIONS: data.partenairesPage?.sections,
    PARTENAIRES_SECTIONS_HAUT: data.partenairesPage?.sectionsHaut,
    HOME: data.home,
    CONTACT: data.contact,
    MENTIONS_LEGALES: data.mentionsLegales,
    PRESSE: data.presse,
    FOOTER: data.footer,
    NEWSLETTER: data.newsletter,
    MENU: menuData.menu,
  };
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent doit être utilisé sous <ContentProvider>');
  return ctx;
}
