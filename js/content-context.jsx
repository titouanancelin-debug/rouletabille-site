/* Pont entre le contenu statique (bundlé au build depuis content/*.json) et
   l'édition visuelle TinaCMS : quand la page est chargée dans l'aperçu live de
   Tina, on bascule sur les données interrogées en direct via le client
   GraphQL généré, enrichies par useTina pour permettre le clic-pour-éditer
   (data-tina-field). En dehors de ce contexte (site public), on ne fait
   aucun appel réseau supplémentaire : le contenu reste celui bundlé au build. */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTina, useEditState } from 'tinacms/react';
import { client } from '../tina/__generated__/client';
import { expandAtelierRecurrence } from './recurrence.js';

import spectaclesData from '../content/spectacles.json';
import agendaData from '../content/agenda.json';
import ateliersData from '../content/ateliers.json';
import equipeData from '../content/equipe.json';
import partenairesData from '../content/partenaires.json';
import homeData from '../content/home.json';
import contactData from '../content/contact.json';
import mentionsLegalesData from '../content/mentionsLegales.json';
import presseData from '../content/presse.json';
import footerData from '../content/footer.json';
import newsletterData from '../content/newsletter.json';
import menuData from '../content/menu.json';

const COLLECTIONS = {
  spectacles:      { staticDoc: spectaclesData,      relativePath: 'spectacles.json' },
  agenda:          { staticDoc: agendaData,          relativePath: 'agenda.json' },
  ateliers:        { staticDoc: ateliersData,        relativePath: 'ateliers.json' },
  equipe:          { staticDoc: equipeData,          relativePath: 'equipe.json' },
  partenaires:     { staticDoc: partenairesData,     relativePath: 'partenaires.json' },
  home:            { staticDoc: homeData,            relativePath: 'home.json' },
  contact:         { staticDoc: contactData,         relativePath: 'contact.json' },
  mentionsLegales: { staticDoc: mentionsLegalesData, relativePath: 'mentionsLegales.json' },
  presse:          { staticDoc: presseData,          relativePath: 'presse.json' },
  footer:          { staticDoc: footerData,          relativePath: 'footer.json' },
  newsletter:      { staticDoc: newsletterData,      relativePath: 'newsletter.json' },
  menu:            { staticDoc: menuData,            relativePath: 'menu.json' },
};

/* `field` lets a caller read a different top-level key than the collection
   name — used to expose the "sections" (sections libres) sibling field that
   sits next to the main list on spectacles/agenda/ateliers/equipe/partenaires. */
function useLiveCollection(name, field = name) {
  const { staticDoc, relativePath } = COLLECTIONS[name];
  const { edit } = useEditState();
  const [fetched, setFetched] = useState(null);

  useEffect(() => {
    if (!edit) { setFetched(null); return undefined; }
    let cancelled = false;
    client.queries[name]({ relativePath }).then((res) => {
      if (!cancelled) setFetched(res);
    });
    return () => { cancelled = true; };
  }, [edit]);

  const tina = useTina({
    query: fetched?.query ?? '',
    variables: fetched?.variables ?? {},
    data: fetched?.data,
  });

  if (edit && tina.data) {
    return field === name ? tina.data[name][name] : tina.data[name][field];
  }
  return staticDoc[field];
}

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const agendaFromContent = useLiveCollection('agenda');
  const ateliers = useLiveCollection('ateliers');
  const agenda = useMemo(
    () => [...agendaFromContent, ...expandAtelierRecurrence(ateliers)],
    [agendaFromContent, ateliers]
  );

  const value = {
    SPECTACLES: useLiveCollection('spectacles'),
    SPECTACLES_SECTIONS: useLiveCollection('spectacles', 'sections'),
    AGENDA: agenda,
    AGENDA_SECTIONS: useLiveCollection('agenda', 'sections'),
    ATELIERS: ateliers,
    ATELIERS_SECTIONS: useLiveCollection('ateliers', 'sections'),
    EQUIPE: useLiveCollection('equipe'),
    EQUIPE_SECTIONS: useLiveCollection('equipe', 'sections'),
    PARTENAIRES: useLiveCollection('partenaires'),
    PARTENAIRES_SECTIONS: useLiveCollection('partenaires', 'sections'),
    HOME: useLiveCollection('home'),
    CONTACT: useLiveCollection('contact'),
    MENTIONS_LEGALES: useLiveCollection('mentionsLegales'),
    PRESSE: useLiveCollection('presse'),
    FOOTER: useLiveCollection('footer'),
    NEWSLETTER: useLiveCollection('newsletter'),
    MENU: useLiveCollection('menu'),
  };
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent doit être utilisé sous <ContentProvider>');
  return ctx;
}
