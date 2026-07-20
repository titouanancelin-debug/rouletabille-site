/* Rendu du contenu riche TinaCMS :
   - RichText : affiche un champ rich-text (gras, italique, listes, liens,
     titres H2/H3/H4 stylés dans styles.css via la classe .rich).
   - SectionsLibres : zone de blocs composables depuis l'admin Tina (titre,
     texte, image, image+texte, encart, citation, espace) — l'équipe les
     ajoute, réordonne et supprime sans toucher au code. */

import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { tinaField } from 'tinacms/react';
import { marked } from 'marked';

/* Deux formes possibles pour un champ rich-text :
   - site public (contenu bundlé depuis content/*.json) : chaîne markdown,
     parsée ici avec marked ;
   - aperçu d'édition Tina (données GraphQL live) : AST, rendu par TinaMarkdown. */
export const RichText = ({ content, className, style, field }) => {
  if (!content) return null;
  const cls = `rich${className ? ' ' + className : ''}`;
  if (typeof content === 'string') {
    return (
      <div className={cls} style={style} data-tina-field={field}
        dangerouslySetInnerHTML={{ __html: marked.parse(content) }}/>
    );
  }
  return (
    <div className={cls} style={style} data-tina-field={field}>
      <TinaMarkdown content={content}/>
    </div>
  );
};

/* ─── Sections libres ─── */

const TITRE_SIZES  = { moyen: 'clamp(24px, 3vw, 36px)', grand: 'clamp(34px, 4.6vw, 56px)', enorme: 'clamp(48px, 7vw, 92px)' };
const TEXTE_SIZES  = { petit: 14, normal: 16, grand: 20, tresGrand: 26 };
const ALIGN        = { gauche: 'left', centre: 'center', droite: 'right' };
const IMG_WIDTH    = { petite: 380, moyenne: 640, pleine: '100%' };
const ESPACE       = { petit: 24, moyen: 64, grand: 128 };

/* Le contenu statique porte _template ; les données live de Tina portent
   __typename (ex: HomeHomeSectionsImageTexte). */
const templateOf = (s) => {
  if (s._template) return s._template;
  const m = (s.__typename || '').match(/(ImageTexte|Titre|Texte|Image|Encart|Citation|Espace)$/);
  return m ? m[1].charAt(0).toLowerCase() + m[1].slice(1) : '';
};

const Bloc = ({ s }) => {
  const f = tinaField(s);
  switch (templateOf(s)) {
    case 'titre':
      return (
        <h2 className="display" data-tina-field={f} style={{
          fontSize: TITRE_SIZES[s.taille] || TITRE_SIZES.grand, lineHeight: 1.02,
          color: s.couleur || 'var(--ink)', textAlign: ALIGN[s.alignement] || 'left',
        }}>{s.texte}</h2>
      );
    case 'texte':
      return (
        <RichText content={s.corps} field={f} style={{
          fontSize: TEXTE_SIZES[s.taille] || TEXTE_SIZES.normal, lineHeight: 1.65,
          color: s.couleur || 'var(--ink-soft)', textAlign: ALIGN[s.alignement] || 'left',
          maxWidth: 760, margin: (ALIGN[s.alignement] || 'left') === 'center' ? '0 auto' : undefined,
        }}/>
      );
    case 'image': {
      const w = IMG_WIDTH[s.largeur] || IMG_WIDTH.moyenne;
      return (
        <figure data-tina-field={f} style={{ margin: 0 }}>
          {s.image && <img src={s.image} alt={s.legende || ''} style={{ width: w, maxWidth: '100%', display: 'block' }}/>}
          {s.legende && <figcaption className="mono" style={{ marginTop: 10, opacity: 0.55 }}>{s.legende}</figcaption>}
        </figure>
      );
    }
    case 'imageTexte': {
      const imgFirst = (s.positionImage || 'gauche') === 'gauche';
      const img = (
        <div style={{ minHeight: 260, position: 'relative' }}>
          {s.image && <img src={s.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>}
        </div>
      );
      return (
        <div data-tina-field={f} style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          background: s.couleurFond || 'var(--paper-warm)', color: s.couleurTexte || 'inherit',
        }}>
          {imgFirst && img}
          <RichText content={s.corps} style={{ padding: 'clamp(24px, 3.5vw, 44px)', fontSize: 16, lineHeight: 1.65, alignSelf: 'center' }}/>
          {!imgFirst && img}
        </div>
      );
    }
    case 'encart':
      return (
        <div className="noise" data-tina-field={f} style={{
          background: s.couleurFond || 'var(--terra)', color: s.couleurTexte || 'var(--paper)',
          padding: 'clamp(28px, 4vw, 48px)',
          maxWidth: IMG_WIDTH[s.largeur] || IMG_WIDTH.pleine,
        }}>
          <RichText content={s.corps} style={{ fontSize: TEXTE_SIZES[s.taille] || 17, lineHeight: 1.6 }}/>
        </div>
      );
    case 'citation':
      return (
        <blockquote data-tina-field={f} style={{ margin: 0, maxWidth: 760 }}>
          <p className={s.style === 'manuscrit' ? 'hand' : 'display display-italic'} style={{
            fontSize: s.style === 'manuscrit' ? 30 : 28, lineHeight: 1.3, color: 'var(--terra)',
          }}>« {s.texte} »</p>
          {s.auteur && <cite className="mono" style={{ display: 'block', marginTop: 12, fontStyle: 'normal', opacity: 0.6 }}>— {s.auteur}</cite>}
        </blockquote>
      );
    case 'espace':
      return <div data-tina-field={f} style={{ height: ESPACE[s.hauteur] ?? ESPACE.moyen }}/>;
    default:
      return null;
  }
};

export const SectionsLibres = ({ doc, background }) => {
  const sections = doc?.sections;
  if (!sections?.length) return null;
  return (
    <section className="section" style={{ background, display: 'grid', gap: 40 }}>
      {sections.map((s, i) => <Bloc key={i} s={s}/>)}
    </section>
  );
};
