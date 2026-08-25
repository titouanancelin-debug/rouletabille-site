/* Rendu du contenu riche venant de Sanity (Portable Text) :
   - RichText : affiche un champ rich-text (gras, italique, listes, liens,
     titres H2/H3/H4 stylés dans styles.css via la classe .rich).
   - SectionsLibres : zone de blocs composables depuis Sanity Studio (titre,
     texte, image, image+texte, encart, citation, espace) — l'équipe les
     ajoute, réordonne et supprime sans toucher au code. */

import { PortableText } from '@portabletext/react';
import { urlFor } from './sanity-client.js';

/* Les liens dans le texte riche (agenda, créations/projets d'archive,
   sections libres...) s'ouvrent dans une vraie fenêtre popup navigateur
   plutôt qu'un nouvel onglet ou une navigation sur place — demande
   explicite de l'équipe. */
const openInPopup = (href) => window.open(href, '_blank', 'noopener,noreferrer,width=900,height=700');

const portableTextComponents = {
  types: {
    image: ({ value }) => (
      <img src={urlFor(value).width(1200).fit('max').auto('format').url()} alt="" loading="lazy" style={{ width: '100%', height: 'auto', display: 'block' }}/>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      <a
        href={value?.href}
        rel="noopener noreferrer"
        onClick={(e) => { if (value?.href) { e.preventDefault(); openInPopup(value.href); } }}
      >
        {children}
      </a>
    ),
  },
};

/* Certains champs "Description" (agenda.desc, spectacle.desc) sont un simple
   textarea Sanity (type "text"), pas du Portable Text : passer une chaîne
   brute à <PortableText> échoue silencieusement (avertissement "Unknown
   block type" en console, rien à l'écran). On rend ces cas en paragraphes
   simples plutôt qu'en Portable Text. */
export const RichText = ({ content, className, style }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  const cls = `rich${className ? ' ' + className : ''}`;
  if (typeof content === 'string') {
    return (
      <div className={cls} style={style}>
        {content.split(/\n+/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
      </div>
    );
  }
  return (
    <div className={cls} style={style}>
      <PortableText value={content} components={portableTextComponents}/>
    </div>
  );
};

/* ─── Sections libres ─── */

const TITRE_SIZES  = { moyen: 'clamp(24px, 3vw, 36px)', grand: 'clamp(34px, 4.6vw, 56px)', enorme: 'clamp(48px, 7vw, 92px)' };
const TEXTE_SIZES  = { petit: 14, normal: 16, grand: 20, tresGrand: 26 };
const ALIGN        = { gauche: 'left', centre: 'center', droite: 'right' };
const IMG_WIDTH    = { petite: 380, moyenne: 640, pleine: '100%' };
const TEXTE_WIDTH   = { petite: 480, moyenne: 760, pleine: 1100 };
const ESPACE       = { petit: 24, moyen: 64, grand: 128 };

const Bloc = ({ s }) => {
  switch (s._type) {
    case 'titreBlock':
      return (
        <h2 className="display" style={{
          fontSize: TITRE_SIZES[s.taille] || TITRE_SIZES.grand, lineHeight: 1.02,
          color: s.couleur || 'var(--ink)', textAlign: ALIGN[s.alignement] || 'left',
        }}>{s.texte}</h2>
      );
    case 'texteBlock':
      return (
        <RichText content={s.corps} style={{
          fontSize: TEXTE_SIZES[s.taille] || TEXTE_SIZES.normal, lineHeight: 1.65,
          color: s.couleur || 'var(--ink-soft)', textAlign: ALIGN[s.alignement] || 'left',
          maxWidth: TEXTE_WIDTH[s.largeur] || TEXTE_WIDTH.moyenne, margin: (ALIGN[s.alignement] || 'left') === 'center' ? '0 auto' : undefined,
        }}/>
      );
    case 'imageBloc': {
      const w = IMG_WIDTH[s.largeur] || IMG_WIDTH.moyenne;
      const src = s.image ? urlFor(s.image).width(typeof w === 'number' ? w * 2 : 1600).url() : null;
      return (
        <figure style={{ margin: 0 }}>
          {src && <img src={src} alt={s.legende || ''} style={{ width: w, maxWidth: '100%', display: 'block' }}/>}
          {s.legende && <figcaption className="mono" style={{ marginTop: 10, opacity: 0.55 }}>{s.legende}</figcaption>}
        </figure>
      );
    }
    case 'imageTexteBlock': {
      const imgFirst = (s.positionImage || 'gauche') === 'gauche';
      const src = s.image ? urlFor(s.image).width(1200).url() : null;
      const img = (
        <div style={{ minHeight: 260, position: 'relative' }}>
          {src && <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>}
        </div>
      );
      return (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          background: s.couleurFond || 'var(--paper-warm)', color: s.couleurTexte || 'inherit',
        }}>
          {imgFirst && img}
          <RichText content={s.corps} style={{ padding: 'clamp(24px, 3.5vw, 44px)', fontSize: 16, lineHeight: 1.65, alignSelf: 'center' }}/>
          {!imgFirst && img}
        </div>
      );
    }
    case 'encartBlock':
      return (
        <div className="noise" style={{
          background: s.couleurFond || 'var(--terra)', color: s.couleurTexte || 'var(--paper)',
          padding: 'clamp(28px, 4vw, 48px)',
          maxWidth: IMG_WIDTH[s.largeur] || IMG_WIDTH.pleine,
        }}>
          <RichText content={s.corps} style={{ fontSize: TEXTE_SIZES[s.taille] || 17, lineHeight: 1.6 }}/>
        </div>
      );
    case 'citationBlock':
      return (
        <blockquote style={{ margin: 0, maxWidth: 760 }}>
          <p className={s.style === 'manuscrit' ? 'hand' : 'display display-italic'} style={{
            fontSize: s.style === 'manuscrit' ? 30 : 28, lineHeight: 1.3, color: 'var(--terra)',
          }}>« {s.texte} »</p>
          {s.auteur && <cite className="mono" style={{ display: 'block', marginTop: 12, fontStyle: 'normal', opacity: 0.6 }}>— {s.auteur}</cite>}
        </blockquote>
      );
    case 'espaceBlock':
      return <div style={{ height: ESPACE[s.hauteur] ?? ESPACE.moyen }}/>;
    default:
      return null;
  }
};

export const SectionsLibres = ({ doc, background }) => {
  const sections = doc?.sections;
  if (!sections?.length) return null;
  return (
    <section className="section" style={{ background, display: 'grid', gap: 40 }}>
      {sections.map((s, i) => <Bloc key={s._key ?? i} s={s}/>)}
    </section>
  );
};
