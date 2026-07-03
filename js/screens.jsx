/* Écrans : Home, Spectacles, FicheSpectacle, Agenda, Ateliers, Équipe, Partenaires, Contact */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Motif, MotifHero, MotifMark, Poster } from './motif.jsx';
import { SPECTACLES, AGENDA, ATELIERS, EQUIPE, PARTENAIRES } from './data.jsx';
import { prefersReduced, Reveal, KineticTitle, useParallax } from './fx.jsx';

/* ─── Formulaires : Netlify Forms ──────────────────────────────────────────
   Géré nativement par Netlify au déploiement — aucun compte externe requis.
   Les formulaires statiques miroirs (mêmes name= et champs) sont déclarés
   dans index.html pour que le bot Netlify les détecte au build, car ceux-ci
   ne sont rendus par React qu'après chargement du JS.
   ─────────────────────────────────────────────────────────────────────── */
async function postForm(formName, data) {
  const body = new URLSearchParams({ 'form-name': formName, ...data }).toString();
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('http_error');
}

/* ======================= NAV ======================= */
const ATELIER_CATS = [
  { id:"", label:"Tous les ateliers" },
  { id:"enfants", label:"Enfants (6–11 ans)" },
  { id:"ados", label:"Ados (12–17 ans)" },
  { id:"adultes", label:"Adultes" },
  { id:"ecole", label:"Milieu scolaire" },
  { id:"seniors", label:"Personnes âgées" },
  { id:"quartier", label:"Quartier & résidents" },
  { id:"insertion", label:"Insertion sociale" },
];

const Nav = ({ route, setRoute }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (r) => { setRoute(r); setMobileOpen(false); };

  const items = [
    { id:"home", label:"Accueil" },
    { id:"spectacles", label:"Notre travail" },
    { id:"agenda", label:"Agenda" },
    { id:"equipe", label:"Équipe" },
    { id:"partenaires", label:"Partenaires" },
    { id:"contact", label:"Contact" },
  ];

  return (
    <nav className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav-logo" onClick={() => go("home")} style={{ cursor:"pointer" }}>
        <MotifMark size={32} color="var(--terra)"/>
        <span style={{ display:"flex", flexDirection:"column", lineHeight:1 }}>
          <span>Rouletabille</span>
          <span style={{ fontSize:10, fontFamily:"var(--ff-mono)", letterSpacing:"0.08em", textTransform:"uppercase", opacity:0.55, marginTop:3 }}>Fabrique artistique</span>
        </span>
      </div>
      <div className="nav-menu">
        {items.map(it => (
          <button key={it.id} className={`nav-link ${route.startsWith(it.id) ? "active" : ""}`} onClick={() => setRoute(it.id)}>
            {it.label}
          </button>
        ))}

      </div>

      {/* Hamburger — mobile only */}
      <button className={`nav-burger ${mobileOpen ? "is-open" : ""}`} onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
        <span/><span/><span/>
      </button>

      {/* Overlay mobile */}
      <div className={`nav-mobile ${mobileOpen ? "open" : ""}`}>
        {items.map(it => (
          <button key={it.id} className={`nav-mobile-link ${route.startsWith(it.id) ? "active" : ""}`} onClick={() => go(it.id)}>
            {it.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

/* ======================= BOTANIC HERO ======================= */
const BotanicHero = ({ setRoute }) => (
  <section style={{
    minHeight: "100vh",
    background: "var(--terra)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  }}>
    {/* Halo ambré au centre-droit */}
    <div aria-hidden="true" style={{
      position: "absolute",
      right: "8%",
      top: "50%",
      transform: "translateY(-50%)",
      width: "56vw",
      height: "56vw",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(232,181,66,0.13) 0%, rgba(184,74,46,0.08) 45%, transparent 70%)",
      zIndex: 0,
      pointerEvents: "none",
    }}/>

    {/* Grande composition physalis — occupe le tiers droit */}
    <div aria-hidden="true" className="hero-plant">
      <MotifHero
        color="rgba(244,232,213,0.70)"
        berryColor="var(--terra)"
        style={{ width: "100%", height: "100%" }}
      />
    </div>

    {/* Dégradé gauche — assure la lisibilité du texte */}
    <div aria-hidden="true" style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to right, var(--terra) 44%, rgba(42,20,24,0.82) 62%, rgba(42,20,24,0.32) 78%, transparent 100%)",
      zIndex: 2,
      pointerEvents: "none",
    }}/>

    {/* Dégradé bas — raccord avec la section suivante */}
    <div aria-hidden="true" style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
      background: "linear-gradient(to bottom, transparent, var(--terra))",
      zIndex: 2,
      pointerEvents: "none",
    }}/>

    {/* Contenu texte */}
    <div style={{
      position: "relative",
      zIndex: 3,
      padding: "clamp(80px, 12vh, 140px) var(--pad-x)",
      maxWidth: 580,
    }}>
      <Reveal variant="fade" delay={80}>
        <div className="eyebrow" style={{ marginBottom: 28 }}>
          Saison 2025 — 2026 · Périgueux & Dordogne
        </div>
      </Reveal>

      <h1 className="display" style={{
        fontSize: "clamp(54px, 6.5vw, 108px)",
        lineHeight: 0.96,
        marginBottom: 32,
        color: "var(--paper)",
      }}>
        <KineticTitle lineDelay={110} baseDelay={160} lines={[
          <>Théâtre <span className="display-italic">vivant</span>,</>,
          <>corps & <span className="display-italic">voix</span>.</>,
        ]}/>
      </h1>

      <Reveal variant="up" delay={520} as="p" style={{
        fontSize: 18,
        lineHeight: 1.65,
        color: "color-mix(in oklab, var(--paper) 78%, transparent)",
        maxWidth: 440,
        marginBottom: 40,
        textWrap: "pretty",
      }}>
        Compagnie de création installée à Périgueux depuis 1993. Spectacles, ateliers et rencontres artistiques ouverts à tous, ancrés dans le territoire.
      </Reveal>

      <Reveal variant="up" delay={640} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="btn btn-amber" onClick={() => setRoute("spectacles")}>
          Découvrir les spectacles →
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => setRoute("agenda")}
          style={{ color: "var(--paper)", borderColor: "color-mix(in oklab, var(--paper) 35%, transparent)" }}
        >
          Voir l'agenda
        </button>
      </Reveal>

      {/* Petit fil conducteur — date de fondation */}
      <Reveal variant="fade" delay={900} style={{
        marginTop: 56,
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: "color-mix(in oklab, var(--paper) 36%, transparent)",
        fontSize: 11,
        letterSpacing: "0.1em",
        fontFamily: "var(--ff-mono)",
        textTransform: "uppercase",
      }}>
        <span style={{ display: "block", width: 32, height: "1px", background: "currentColor", flexShrink: 0 }}/>
        Fondée en 1993 · Dordogne
      </Reveal>
    </div>

    {/* Scroll cue */}
    <div className="scroll-cue">
      <span>Défiler</span>
      <span className="cue-rail"><span className="cue-dot"/></span>
    </div>
  </section>
);

/* ======================= SCROLL EXPAND HERO ======================= */
const ScrollExpandHero = ({ setRoute }) => {
  const [p, setP]           = useState(0);
  const [expanded, setExpanded] = useState(false);
  const pRef       = useRef(0);
  const expandedRef = useRef(false);
  const touchRef   = useRef(0);

  useEffect(() => {
    if (prefersReduced()) return;

    const onWheel = (e) => {
      if (expandedRef.current) {
        if (e.deltaY < 0 && window.scrollY <= 2) {
          expandedRef.current = false; setExpanded(false);
          pRef.current = 0.97;        setP(0.97);
        }
        return;
      }
      e.preventDefault();
      const next = Math.min(Math.max(pRef.current + e.deltaY * 0.0012, 0), 1);
      pRef.current = next; setP(next);
      if (next >= 1) { expandedRef.current = true; setExpanded(true); }
    };

    const onScroll = () => { if (!expandedRef.current) window.scrollTo(0, 0); };

    const onTouchStart = (e) => { touchRef.current = e.touches[0].clientY; };

    const onTouchMove = (e) => {
      const cur = e.touches[0].clientY;
      const delta = touchRef.current - cur;
      if (expandedRef.current) {
        if (delta < -20 && window.scrollY <= 2) {
          expandedRef.current = false; setExpanded(false);
          pRef.current = 0.97;        setP(0.97);
        }
        touchRef.current = cur;
        return;
      }
      e.preventDefault();
      const factor = delta < 0 ? 0.008 : 0.005;
      const next = Math.min(Math.max(pRef.current + delta * factor, 0), 1);
      pRef.current = next; setP(next);
      if (next >= 1) { expandedRef.current = true; setExpanded(true); }
      touchRef.current = cur;
    };

    const onTouchEnd = () => { touchRef.current = 0; };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("scroll",     onScroll,     { passive: true  });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });
    window.addEventListener("touchend",   onTouchEnd);
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("scroll",     onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  if (prefersReduced()) return <BotanicHero setRoute={setRoute}/>;

  const textShift = p * 26; // vw

  return (
    <section style={{
      position: "relative",
      minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      background: "var(--terra)",
    }}>
      {/* Halo ambré — s'intensifie pendant l'expansion */}
      <div aria-hidden style={{
        position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)",
        width: "56vw", height: "56vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,181,66,0.13) 0%, rgba(184,74,46,0.08) 45%, transparent 70%)",
        opacity: Math.min(1, p * 1.4),
        zIndex: 0, pointerEvents: "none",
      }}/>

      {/* ——— Carte physalis qui s'ouvre ——— */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width:  `${30 + p * 70}vw`,
        height: `${38 + p * 62}vh`,
        maxWidth: "100vw", maxHeight: "100vh",
        overflow: "hidden",
        zIndex: 1,
        borderRadius: `${Math.max(0, 8 * (1 - p))}px`,
        boxShadow: `0 ${Math.round(6*(1-p))}px ${Math.round(50*(1-p))}px rgba(0,0,0,${(0.38*(1-p)).toFixed(2)})`,
      }}>
        <div style={{ width: "100%", height: "100%", background: "var(--terra)", position: "relative", overflow: "hidden" }}>

          {/* Composition physalis — hero-plant (se place à droite quand la carte s'ouvre) */}
          <div aria-hidden className="hero-plant" style={{ opacity: 0.28 + p * 0.64, zIndex: 2 }}>
            <MotifHero color="rgba(244,232,213,0.72)" berryColor="var(--terra)" style={{ width: "100%", height: "100%" }}/>
          </div>

          {/* Voile sombre : épais quand la carte est petite, léger quand plein écran */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 3,
            background: `rgba(42,20,24,${(0.58 - p * 0.52).toFixed(2)})`,
            pointerEvents: "none",
          }}/>

          {/* Voile central (lisibilité texte) — apparaît en fin d'expansion, léger pour laisser voir la physalis */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 4,
            background: "radial-gradient(ellipse 52% 42% at center, rgba(42,20,24,0.55) 12%, rgba(42,20,24,0.4) 42%, rgba(42,20,24,0.12) 68%, transparent 88%)",
            opacity: Math.max(0, (p - 0.68) * 3.1) * 0.75,
            pointerEvents: "none",
          }}/>

          {/* Fade vers la section suivante */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 120, zIndex: 4,
            background: "linear-gradient(to bottom, transparent, var(--terra))",
            opacity: p,
            pointerEvents: "none",
          }}/>

          {/* Mention poster (visible uniquement en petit) */}
          <div style={{
            position: "absolute", bottom: 18, left: 0, right: 0, zIndex: 5,
            display: "flex", justifyContent: "space-between", padding: "0 20px",
            opacity: Math.max(0, 1 - p * 7),
            color: "rgba(244,232,213,0.38)",
            fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
            pointerEvents: "none",
          }}>
            <span>Périgueux · Dordogne</span>
            <span>Est. 1993</span>
          </div>

          {/* ——— Contenu hero complet — apparaît une fois la carte ouverte ——— */}
          {expanded && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "clamp(80px, 12vh, 140px) var(--pad-x)",
              textAlign: "center",
            }}>
              <div style={{ maxWidth: 640, margin: "0 auto" }}>
                <Reveal variant="fade" delay={80}>
                  <div className="eyebrow" style={{ marginBottom: 28 }}>
                    Saison 2025 — 2026 · Périgueux & Dordogne
                  </div>
                </Reveal>
                <h1 className="display" style={{ fontSize: "clamp(54px, 6.5vw, 108px)", lineHeight: 0.96, marginBottom: 32, color: "var(--paper)" }}>
                  <KineticTitle lineDelay={110} baseDelay={160} lines={[
                    <>Théâtre <span className="display-italic">vivant</span>,</>,
                    <>corps & <span className="display-italic">voix</span>.</>,
                  ]}/>
                </h1>
                <Reveal variant="up" delay={520} as="p" style={{ fontSize: 18, lineHeight: 1.65, color: "color-mix(in oklab, var(--paper) 78%, transparent)", maxWidth: 440, margin: "0 auto 40px", textWrap: "pretty" }}>
                  Compagnie de création installée à Périgueux depuis 1993. Spectacles, ateliers et rencontres artistiques ouverts à tous, ancrés dans le territoire.
                </Reveal>
                <Reveal variant="up" delay={640} style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                  <button className="btn btn-amber" onClick={() => setRoute("spectacles")}>Découvrir les spectacles →</button>
                  <button className="btn btn-ghost" onClick={() => setRoute("agenda")} style={{ color: "var(--paper)", borderColor: "color-mix(in oklab, var(--paper) 35%, transparent)" }}>Voir l'agenda</button>
                </Reveal>
                <Reveal variant="fade" delay={900} style={{ marginTop: 56, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, color: "color-mix(in oklab, var(--paper) 36%, transparent)", fontSize: 11, letterSpacing: "0.1em", fontFamily: "var(--ff-mono)", textTransform: "uppercase" }}>
                  <span style={{ display: "block", width: 32, height: "1px", background: "currentColor", flexShrink: 0 }}/>
                  Fondée en 1993 · Dordogne
                </Reveal>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ——— Titre qui s'écarte pendant l'expansion ——— */}
      {!expanded && (
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 10, pointerEvents: "none",
        }}>
          <span className="display" style={{
            fontSize: "clamp(34px, 5vw, 84px)", color: "var(--paper)", lineHeight: 0.95,
            transform: `translateX(-${textShift}vw)`,
            willChange: "transform",
            mixBlendMode: "difference",
            whiteSpace: "nowrap",
          }}>Rouletabille</span>
          <span className="display display-italic" style={{
            fontSize: "clamp(20px, 3.1vw, 50px)", color: "var(--paper)", lineHeight: 0.95,
            transform: `translateX(${textShift}vw)`,
            willChange: "transform",
            mixBlendMode: "difference",
            whiteSpace: "nowrap",
          }}>fabrique artistique</span>
        </div>
      )}

      {/* Scroll cue */}
      {!expanded && p < 0.25 && (
        <div className="scroll-cue" style={{ opacity: Math.max(0, 1 - p * 8), zIndex: 3 }}>
          <span>Défiler</span>
          <span className="cue-rail"><span className="cue-dot"/></span>
        </div>
      )}
    </section>
  );
};

/* ======================= HISTOIRE D'UN PROJET ======================= */
const HISTOIRE_SECTIONS = [
  {
    id: "immersion",
    num: "01",
    label: "Immersion",
    teaser: "La compagnie est installée dans le quartier du Toulon à Périgueux depuis 1993, ancré dans un quartier façonné par l'histoire ferroviaire et ouvrière.",
    paragraphs: [
      "La compagnie est installée dans le quartier du Toulon à Périgueux depuis 1993. Celui-ci est marqué par son origine en 1857 au moment de l'implantation de la ligne de chemin de fer et des ateliers de réparation ferroviaire du « Paris-Orléans ». Depuis 1960, la communauté des cheminots s'est transformée, a diminué. Mais le quartier garde les traces de ce passé.",
      "La plupart des maisons sont construites sur le principe de la loi Loucheur, lui gardant un aspect de « cité ouvrière ».",
      "La compagnie Rouletabille a été fondée le 27 septembre 1993 par 11 personnes d'origines diverses ayant toutes un lien avec le quartier du Toulon : résidant, travailleur, liens familiaux. Toutes étaient portées par des valeurs d'Education Populaire.",
      "Elle a pour premier partenaire le Comité de Quartier du Toulon dont la mission est « Ecouter, Proposer ». Ce comité l'a encouragé à la mise en place de propositions artistiques notamment en direction des enfants car aucune activité n'existait alors. Ainsi, la mise en place d'un atelier de pratique artistique théâtrale à l'adresse des enfants et adolescents s'est concrétisé sur le quartier dès le mois d'avril 1994. Un premier spectacle « Grandir, déjà ! » en 1994, s'en suivront une quinzaine de création.",
      "Durant plusieurs années, la compagnie partage le bureau du Comité de Quartier du Toulon et développe ses interventions et ses projets en itinérance sur la ville de Périgueux et le département. L'équipe grandit au fil des années, se forme, se structure.",
      "En 2008, la compagnie intègre « La Filature de l'Isle », ancienne manufacture de vêtements du quartier, où un pôle culturel et sportif communal est désormais installé. Ce lieu s'inscrit dans l'histoire des quartiers populaires, et la compagnie y développe depuis un projet global de « lieu de rencontre et d'expérimentation artistique pour Tous ».",
      "Pourquoi Rouletabille ? Aucune référence à l'auteur Gaston Leroux ! Parce que « roule ta bosse », pour suivre les encouragements institutionnels à une forme de « décentralisation théâtrale », à l'émergence de nouvelle structure pour porter l'emploi artistique.",
    ],
  },
  {
    id: "partage",
    num: "02",
    label: "Partage, pratique et découverte avec et pour Tous",
    teaser: "En automne 2023, notre compagnie a fêté ses 30 ans d'existence. Un projet de création et de transmission de l'art théâtral, ouvert à la diversité humaine et culturelle du territoire.",
    paragraphs: [
      "En automne 2023, notre compagnie a fêté ses 30 ans d'existence. Au cours de ces années nous avons affiné nos choix et nos orientations. Nous revendiquons une activité de création et de transmission de l'art théâtral. Ce qui nous intéresse avant tout c'est la personne dans son humanité et comment cette personne peut s'ouvrir au monde à travers d'une pratique culturelle en tant qu'acteur ou spectateur.",
      "Théâtre social, éducation populaire, création, lien social dans les quartiers, action culturelle de proximité, ateliers, stages, spectacles, rencontres… difficile de faire bref…",
      "Pour aborder la diversité humaine et culturelle de notre territoire (dont nous suivons l'évolution au fil des années), qui nous concerne et nous motive particulièrement : nous créons des actions culturelles de proximité, spécifiques, avec nos partenaires locaux, institutionnels et associatifs. En fonction des objectifs et des possibilités, nous proposons des actions qui nous sont propres — spectacle, ateliers, stages — et des opérations « sur mesure » que nous construisons en étroite collaboration avec les besoins identifiés sur le terrain.",
      "Nous souhaitons dans tous les cas, concevoir et proposer de nouveaux contextes de rencontre, décomplexants, responsabilisants et de partage, grâce à un théâtre social et artisanal, convivial et festif, pluridisciplinaire (musique, conte, mouvement, images…) qui unit acteurs et spectateurs dans un temps.",
      "Un lieu de Culture pour Tous, tel est notre projet depuis son origine.",
    ],
  },
  {
    id: "equipe",
    num: "03",
    label: "Une équipe — Une Compagnie",
    teaser: "Composée de professionnels aux compétences variées et de bénévoles engagés, l'équipe de Rouletabille avance et se façonne.",
    paragraphs: [
      "Composée de professionnels aux compétences variées et complémentaires (comédien, musicien, vidéaste, plasticien, administrateur...) et de bénévoles engagés, l'équipe de Rouletabille avance et se façonne et aujourd'hui accueille de nouveaux membres. Un noyau fondateur reste à l'écoute des projets menés, et accompagne l'équipe dans la construction des activités.",
    ],
  },
];

const HistoireAccordion = () => {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ borderTop:"1px solid var(--rule)" }}>
      {HISTOIRE_SECTIONS.map((s) => {
        const isOpen = open === s.id;
        return (
          <div key={s.id} style={{ borderBottom:"1px solid var(--rule)" }}>
            <button
              onClick={() => setOpen(isOpen ? null : s.id)}
              style={{
                width:"100%", textAlign:"left", background:"none", border:"none", cursor:"pointer",
                padding:"28px 0", display:"grid", gridTemplateColumns:"40px 1fr auto", gap:24, alignItems:"start",
                transition:"color 0.2s",
              }}
              aria-expanded={isOpen}
            >
              <span className="mono" style={{ fontSize:11, opacity:0.45, paddingTop:6 }}>{s.num}</span>
              <div>
                <h3 className="display" style={{
                  fontSize:"clamp(20px, 2.8vw, 32px)", lineHeight:1.05, marginBottom: isOpen ? 0 : 12,
                  color: isOpen ? "var(--terra)" : "var(--ink)", transition:"color 0.2s",
                }}>
                  {s.label}
                </h3>
                {!isOpen && (
                  <p style={{ fontSize:15, lineHeight:1.55, color:"var(--ink-soft)", margin:0, textWrap:"pretty" }}>
                    {s.teaser}
                  </p>
                )}
              </div>
              <span style={{
                fontSize:22, lineHeight:1, color:"var(--terra)", marginTop:4,
                transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                transition:"transform 0.3s ease",
                display:"block", flexShrink:0,
              }}>+</span>
            </button>
            <div style={{
              overflow:"hidden",
              maxHeight: isOpen ? 1800 : 0,
              transition:"max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
              <div style={{ paddingLeft:64, paddingBottom:32 }}>
                {s.paragraphs.map((p, i) => (
                  <p key={i} style={{
                    fontSize:16, lineHeight:1.75, color:"var(--ink-soft)",
                    marginBottom: i < s.paragraphs.length - 1 ? 18 : 0,
                    textWrap:"pretty",
                  }}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ======================= EVENT CAROUSEL ======================= */
const FR_MONTHS_IDX = {Jan:0,Fév:1,Mar:2,Avr:3,Mai:4,Juin:5,Juil:6,Août:7,Sep:8,Oct:9,Nov:10,Déc:11};

const getFeaturedEvents = () => {
  const seen = new Set();
  return AGENDA
    .filter(d => {
      if (!["spectacle","événement","résidence"].includes(d.type)) return false;
      const key = d.spectacle ?? d.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const da = new Date(+a.year, FR_MONTHS_IDX[a.month] ?? 0, +a.day);
      const db = new Date(+b.year, FR_MONTHS_IDX[b.month] ?? 0, +b.day);
      return da - db;
    })
    .slice(0, 6);
};

const TYPE_LABEL = { spectacle:"Spectacle", événement:"Événement", résidence:"Résidence" };

const EventCard = ({ item, setRoute, setSpectacle }) => {
  const sp = item.spectacle ? SPECTACLES.find(s => s.id === item.spectacle) : null;
  const spIdx = sp ? SPECTACLES.findIndex(s => s.id === item.spectacle) : 0;
  const ink = item.cardTextColor || "var(--paper)";

  const handleClick = () => {
    if (sp) { setSpectacle(item.spectacle); setRoute("spectacles/detail"); }
    else setRoute("agenda");
  };

  return (
    <article onClick={handleClick} style={{ cursor:"pointer" }}>
      <div className="card-fx" style={{ aspectRatio:"3/4", position:"relative", overflow:"hidden" }}>
        {sp ? (
          <>
            <Poster bg={sp.color} ink={sp.textColor} title={sp.title} subtitle={sp.tag} num={sp.num} variant={spIdx % 4}/>
            <div style={{
              position:"absolute", bottom:0, left:0, right:0,
              background:"linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)",
              padding:"52px 18px 18px", color:"#fff",
            }}>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:11, marginBottom:4, opacity:0.78 }}>{item.venue}</div>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:11, opacity:0.58 }}>{item.time} · {item.price}</div>
            </div>
          </>
        ) : (
          <div className="noise" style={{
            background: item.cardColor || "var(--aubergine)", color: ink,
            width:"100%", height:"100%", padding:28,
            display:"flex", flexDirection:"column", justifyContent:"space-between",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", right:-40, bottom:-40, opacity:0.14 }}>
              <Motif size={260} color={ink} berryColor={ink} rotate={15} seed={2}/>
            </div>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:9, fontWeight:700, letterSpacing:"0.12em", padding:"3px 10px", border:`1px solid ${ink}`, display:"inline-block", marginBottom:24, opacity:0.72, textTransform:"uppercase" }}>
                {TYPE_LABEL[item.type]}
              </div>
              <h3 className="display" style={{ fontSize:"clamp(22px, 2.8vw, 34px)", lineHeight:1.02 }}>{item.title}</h3>
            </div>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:12, marginBottom:4, opacity:0.68 }}>{item.venue}</div>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:12, opacity:0.5 }}>{item.time} · {item.price}</div>
            </div>
          </div>
        )}
        {item.status === "few" && (
          <div style={{ position:"absolute", top:12, right:12, background:"var(--amber-deep)", color:"#fff", fontFamily:"var(--ff-mono)", fontSize:9, fontWeight:700, letterSpacing:"0.08em", padding:"3px 8px", textTransform:"uppercase" }}>
            Dernières places
          </div>
        )}
        {item.status === "sold" && (
          <div style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.75)", color:"#fff", fontFamily:"var(--ff-mono)", fontSize:9, fontWeight:700, letterSpacing:"0.08em", padding:"3px 8px", textTransform:"uppercase" }}>
            Complet
          </div>
        )}
        {(item.status === "free" && !sp) && (
          <div style={{ position:"absolute", top:12, right:12, background:"var(--terra)", color:"#fff", fontFamily:"var(--ff-mono)", fontSize:9, fontWeight:700, letterSpacing:"0.08em", padding:"3px 8px", textTransform:"uppercase" }}>
            Entrée libre
          </div>
        )}
      </div>
      <div style={{ padding:"12px 0 8px", borderTop:"1px solid var(--rule)", marginTop:10 }}>
        <div style={{ fontFamily:"var(--ff-mono)", fontSize:10, color:"var(--terra)", marginBottom:4 }}>
          {item.day} {item.month} · {TYPE_LABEL[item.type]}
        </div>
        <h4 className="display" style={{ fontSize:"clamp(14px, 1.3vw, 17px)", lineHeight:1.1 }}>
          {sp?.title || item.title}<span className="card-arrow">→</span>
        </h4>
      </div>
    </article>
  );
};

const EventCarousel = ({ setRoute, setSpectacle }) => {
  const items = useMemo(getFeaturedEvents, []);
  const [idx, setIdx] = useState(0);
  const [layout, setLayout] = useState({ w:900, cols:3 });
  const containerRef = useRef(null);
  const GAP = 20;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      setLayout({ w, cols: w < 560 ? 1 : w < 900 ? 2 : 3 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, cols } = layout;
  const cardW = Math.floor((w - (cols - 1) * GAP) / cols);
  const maxIdx = Math.max(0, items.length - cols);

  /* Auto-avance toutes les 5s, repart à 0 en fin de liste */
  useEffect(() => {
    if (items.length <= cols) return;
    const t = setTimeout(() => setIdx(i => (i >= maxIdx ? 0 : i + 1)), 5000);
    return () => clearTimeout(t);
  }, [idx, maxIdx, cols, items.length]);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(maxIdx, i + 1));

  return (
    <div>
      <div ref={containerRef} style={{ overflow:"hidden" }}>
        <div style={{
          display:"flex", gap:GAP,
          transform:`translateX(-${idx * (cardW + GAP)}px)`,
          transition:"transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange:"transform",
        }}>
          {items.map((item, i) => (
            <div key={i} style={{ flex:`0 0 ${cardW}px`, minWidth:0 }}>
              <EventCard item={item} setRoute={setRoute} setSpectacle={setSpectacle}/>
            </div>
          ))}
        </div>
      </div>

      {/* Contrôles : dots + flèches */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {Array.from({ length: maxIdx + 1 }, (_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`Groupe ${i + 1}`} style={{
              width: i === idx ? 28 : 8, height:8, borderRadius:4, padding:0, flexShrink:0,
              background: i === idx ? "var(--terra)" : "var(--rule-strong)",
              border:"none", cursor:"pointer",
              transition:"width 0.35s cubic-bezier(0.4,0,0.2,1), background 0.35s",
            }}/>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[{ fn:prev, label:"←", dis:idx === 0 }, { fn:next, label:"→", dis:idx >= maxIdx }].map(({ fn, label, dis }) => (
            <button key={label} onClick={fn} disabled={dis} aria-label={label === "←" ? "Précédent" : "Suivant"} style={{
              width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center",
              borderRadius:"50%", border:"1px solid var(--rule-strong)", background:"none",
              cursor: dis ? "default" : "pointer", fontSize:16,
              opacity: dis ? 0.25 : 1, transition:"opacity 0.2s",
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ======================= HOME ======================= */
const Home = ({ setRoute, setSpectacle }) => {
  return (
  <>
    <ScrollExpandHero setRoute={setRoute}/>

    {/* ÉVÉNEMENTS CAROUSEL */}
    <section className="section">
      <Reveal variant="up" className="section-head" style={{ marginBottom:40 }}>
        <div className="section-num">Au programme</div>
        <h2 className="section-title">Prochains<br/><span className="display-italic">rendez-vous.</span></h2>
        <div className="section-meta">Spectacles, résidences et événements de la saison. <a className="link-underline" onClick={() => setRoute("agenda")}>Calendrier complet →</a></div>
      </Reveal>
      <EventCarousel setRoute={setRoute} setSpectacle={setSpectacle}/>
    </section>

    {/* HISTOIRE D'UN PROJET */}
    <section className="section" style={{ background:"var(--paper-warm)", position:"relative", overflow:"hidden" }}>
      <div ref={useParallax(0.1, 60)} className="motif-bg" style={{ right:-80, bottom:-60, opacity:0.1 }}>
        <Motif size={360} color="var(--terra)" berryColor="var(--amber)" rotate={-10} seed={4}/>
      </div>
      <Reveal variant="up" className="section-head" style={{ marginBottom:40 }}>
        <div className="section-num">Histoire</div>
        <h2 className="section-title">Histoire<br/><span className="display-italic">d'un projet.</span></h2>
        <div className="section-meta">Depuis 1993, un projet culturel ancré dans le quartier du Toulon, à Périgueux.</div>
      </Reveal>
      <HistoireAccordion/>
    </section>

    {/* ABOUT BAND */}
    <section className="section" style={{ background:"var(--aubergine)", color:"var(--paper)", position:"relative", overflow:"hidden" }}>
      <div ref={useParallax(0.22, 130)} className="motif-bg" style={{ right:-100, top:-80, opacity:0.4 }}>
        <Motif size={500} color="var(--paper)" berryColor="var(--terra)" rotate={20} seed={3.2}/>
      </div>
      <div className="col-duo" style={{ gap:80, alignItems:"center", position:"relative", zIndex:2 }}>
        <Reveal variant="left">
          <div className="eyebrow" style={{ marginBottom:24 }}>La compagnie</div>
          <h2 className="display" style={{ fontSize:"clamp(48px, 6vw, 84px)" }}>
            Faire théâtre <span className="display-italic">avec</span>
            <br/>les gens, <span className="display-italic">pour</span>
            <br/>les gens.
          </h2>
        </Reveal>
        <Reveal variant="right" delay={120}>
          <p style={{ fontSize:18, lineHeight:1.6, color:"color-mix(in oklab, var(--paper) 88%, transparent)", marginBottom:24, textWrap:"pretty" }}>
            Depuis 1993, la Cie Rouletabille crée des projets artistiques pour permettre à chacun de découvrir, pratiquer et partager la culture. Son action s'inscrit dans une réflexion permanente autour de l'accès à la culture pour tous, en particulier pour les publics éloignés des institutions culturelles traditionnelles.
          </p>
          <p style={{ fontSize:18, lineHeight:1.6, color:"color-mix(in oklab, var(--paper) 88%, transparent)", marginBottom:32 }}>
            Installée à la Filature de l'Isle à Périgueux depuis 2008 — labellisée « Lieu de fabrique » par la Région Nouvelle-Aquitaine — la compagnie mène chaque saison plus de 17 projets d'interventions artistiques en partenariat avec des structures sociales, éducatives et médico-sociales du territoire.
          </p>
          <button className="btn btn-amber" onClick={() => setRoute("equipe")}>Rencontrer l'équipe →</button>
        </Reveal>
      </div>
    </section>

    {/* NEWSLETTER */}
    <Newsletter/>
  </>
  );
};

/* ======================= SPECTACLE CARD ======================= */
const SpectacleCard = ({ s, variant=0, onClick }) => (
  <article className="card card-fx" onClick={onClick} style={{ cursor:"pointer", background:"transparent", border:"none" }}>
    <div className="card-img noise" style={{ aspectRatio:"4/5" }}>
      <Poster bg={s.color} ink={s.textColor} title={s.title} subtitle={s.tag} num={s.num} variant={variant}/>
    </div>
    <div style={{ padding:"16px 4px 8px", display:"flex", justifyContent:"space-between", alignItems:"baseline", borderTop:"1px solid var(--rule)", marginTop:12 }}>
      <div>
        <div className="tag" style={{ color:"var(--terra)", marginBottom:4 }}>{s.tag} · {s.duration}</div>
        <h3 className="display" style={{ fontSize:24, lineHeight:1.05 }}>{s.title}<span className="card-arrow">→</span></h3>
      </div>
      <div className="mono" style={{ opacity:0.6 }}>{s.date}</div>
    </div>
  </article>
);

/* ======================= AGENDA ROW ======================= */
const AgendaRow = ({ d, onClick }) => {
  const status = {
    available: { label:"Places disponibles", color:"var(--terra)" },
    few:       { label:"Dernières places", color:"var(--amber-deep)" },
    sold:      { label:"Complet", color:"var(--ink-soft)" },
  }[d.status];
  return (
    <div className="agenda-row agenda-row-grid" style={{
      padding:"24px 8px", borderTop:"1px solid var(--rule)",
      cursor:"pointer", transition:"background 0.2s"
    }}
    onMouseEnter={e => e.currentTarget.style.background = "color-mix(in oklab, var(--terra) 6%, transparent)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    onClick={onClick}
    >
      <div>
        <div className="display" style={{ fontSize:48, lineHeight:1 }}>{d.day}</div>
        <div className="mono" style={{ marginTop:4 }}>{d.month} {d.year}</div>
      </div>
      <div>
        <h4 className="display" style={{ fontSize:28, lineHeight:1.05 }}>{d.title}</h4>
      </div>
      <div className="agenda-col-venue" style={{ fontFamily:"var(--ff-body)", fontSize:14, color:"var(--ink-soft)" }}>{d.venue}</div>
      <div className="agenda-col-price mono">{d.time} · {d.price}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {status && <><span style={{ width:6, height:6, borderRadius:"50%", background:status.color }}/><span style={{ fontSize:11, color:status.color, fontWeight:500 }}>{status.label}</span></>}
      </div>
      <div className="agenda-col-arrow" style={{ textAlign:"right", fontSize:18 }}>→</div>
    </div>
  );
};

/* ======================= SPECTACLES (liste) ======================= */
const TRAVAIL_TABS = [
  { id:"residences",  label:"Résidences artistiques", num:"01", title:"Résidences artistiques",  sub:"Les résidences de création en cours." },
  { id:"mediations",  label:"Médiations",             num:"02", title:"Médiations & pratiques",   sub:"Ateliers, transmissions, actions de territoire." },
  { id:"evenements",  label:"Événements",              num:"03", title:"Événements",                sub:"Rencontres, restitutions et rendez-vous ouverts." },
  { id:"ateliers",    label:"Ateliers",                num:"04", title:"Ateliers & pratique",       sub:"Pratiques artistiques régulières, stages et cycles." },
];

const Spectacles = ({ setRoute, setSpectacle }) => {
  const [tab, setTab] = useState("residences");
  const [atelierFilter, setAtelierFilter] = useState("");
  const [selectedAtelier, setSelectedAtelier] = useState(null);
  const [formStates, setFormStates] = useState({});
  const residences = AGENDA.filter(d => d.type === "résidence");
  const evenements  = AGENDA.filter(d => d.type === "événement");

  const handleAtelierSubmit = async (e, atelier) => {
    e.preventDefault();
    e.stopPropagation();
    setFormStates(s => ({ ...s, [atelier.num]: 'loading' }));
    const fd = new FormData(e.target);
    try {
      await postForm('atelier', { atelier: atelier.title, ...Object.fromEntries(fd) });
      setFormStates(s => ({ ...s, [atelier.num]: 'sent' }));
    } catch {
      setFormStates(s => ({ ...s, [atelier.num]: 'error' }));
    }
  };

  const atelierList = atelierFilter ? ATELIERS.filter(a => a.audience === atelierFilter) : ATELIERS;

  const getStatus = (s) => {
    const hasDates = AGENDA.some(d => d.spectacle === s.id);
    if (hasDates) return { label:"En diffusion", color:"var(--terra)" };
    return { label:"Répertoire", color:"var(--ink-soft)" };
  };

  return (
    <>
      {/* En-tête fixe */}
      <div className="section" style={{ paddingBottom:0 }}>
        <Reveal variant="up" className="section-head">
          <div className="section-num">Notre travail</div>
          <h2 className="section-title">Résidences, <span className="display-italic">médiations</span><br/>& événements.</h2>
          <div className="section-meta">Un lieu de fabrication artistique ancré sur son territoire — de la résidence de création aux ateliers de pratique ouverts à tous.</div>
        </Reveal>
      </div>

      {/* Barre d'onglets sticky */}
      <div style={{
        position:"sticky", top:56, zIndex:20,
        background:"color-mix(in oklab, var(--paper) 96%, transparent)",
        backdropFilter:"blur(10px)",
        borderBottom:"1px solid var(--rule-strong)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 var(--pad-x)" }}>
          <div style={{ display:"flex" }}>
            {TRAVAIL_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:"16px 24px 14px",
                background:"none", border:"none",
                borderBottom: tab === t.id ? "2px solid var(--terra)" : "2px solid transparent",
                cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                transition:"color 0.2s, border-color 0.2s",
                color: tab === t.id ? "var(--terra)" : "var(--ink-soft)",
              }}>
                <span style={{ fontFamily:"var(--ff-body)", fontSize:13, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</span>
                <span style={{ fontFamily:"var(--ff-mono)", fontSize:10, opacity:0.45 }}>{t.num}</span>
              </button>
            ))}
          </div>
          {/* Titre de la section active */}
          <span className="display-italic" style={{ fontSize:"clamp(18px, 2vw, 26px)", color:"var(--terra)", opacity:0.85, paddingRight:4 }}>
            {TRAVAIL_TABS.find(t => t.id === tab)?.title}
          </span>
        </div>
      </div>

      {/* ── Onglet 1 : Résidences artistiques ── */}
      {tab === "residences" && (
        <section className="section" style={{ background:"var(--aubergine)", color:"var(--paper)", position:"relative", overflow:"hidden", minHeight:"60vh" }}>
          <div ref={useParallax(0.18, 100)} className="motif-bg" style={{ left:-80, bottom:-60, opacity:0.3 }}>
            <Motif size={460} color="var(--paper)" berryColor="var(--terra)" rotate={-25} seed={1.8}/>
          </div>
          <Reveal variant="up" style={{ marginBottom:48, maxWidth:640 }}>
            <p style={{ fontSize:18, lineHeight:1.7, color:"rgba(242,228,200,0.75)", textWrap:"pretty" }}>
              Les résidences de création sont le cœur de notre travail. Des semaines de répétition, d'expérimentation et de recherche, loin de la représentation — là où la forme se cherche encore.
            </p>
          </Reveal>
          {residences.length > 0 ? (
            <div className="grid-2">
              {residences.map((d, i) => (
                <Reveal key={i} variant="up" delay={i * 100}>
                  <div style={{ padding:32, border:"1px solid rgba(242,228,200,0.15)" }}>
                    <div style={{ display:"inline-block", background:"var(--plum)", color:"#fff", fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"4px 10px", textTransform:"uppercase", marginBottom:24 }}>Résidence</div>
                    <h3 className="display" style={{ fontSize:"clamp(24px, 3vw, 36px)", marginBottom:12, lineHeight:1.05 }}>{d.title}</h3>
                    <div className="mono" style={{ opacity:0.5, marginBottom:6 }}>{d.day} {d.month} {d.year}</div>
                    <div style={{ fontSize:14, opacity:0.7, marginBottom:12 }}>{d.venue}</div>
                    <div style={{ fontSize:13, opacity:0.5, fontStyle:"italic" }}>{d.price}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle:"italic", opacity:0.45, fontSize:18 }}>Aucune résidence en cours actuellement.</p>
          )}
        </section>
      )}

      {/* ── Onglet 2 : Médiations ── */}
      {tab === "mediations" && (
        <section className="section" style={{ background:"var(--paper-warm)", position:"relative", overflow:"hidden" }}>
          <div ref={useParallax(0.15, 90)} className="motif-bg" style={{ right:-60, top:-40, opacity:0.2 }}>
            <Motif size={380} color="var(--amber-deep)" berryColor="var(--terra)" rotate={30} seed={3.5}/>
          </div>
          <Reveal variant="up" style={{ marginBottom:48, maxWidth:560 }}>
            <p style={{ fontSize:18, lineHeight:1.7, color:"var(--ink-soft)", textWrap:"pretty" }}>
              La transmission artistique est une activité centrale, pas accessoire. Ateliers réguliers, interventions scolaires, actions de territoire — {ATELIERS.length} ateliers cette saison.
            </p>
          </Reveal>
          <div className="grid-3" style={{ marginBottom:48 }}>
            {ATELIERS.slice(0, 3).map((a, i) => (
              <Reveal key={a.num} variant="up" delay={i * 80}>
                <div className="noise" style={{ background:a.color, color:a.textColor, padding:28, minHeight:220, display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", right:-20, bottom:-30, opacity:0.12 }}>
                    <Motif size={160} color={a.textColor} berryColor={a.textColor} rotate={10} seed={i+1}/>
                  </div>
                  <div>
                    <div className="mono" style={{ marginBottom:16, opacity:0.6 }}>{a.num}</div>
                    <h4 className="display" style={{ fontSize:26, lineHeight:1, marginBottom:10 }}>{a.title}</h4>
                    <div style={{ fontSize:13, opacity:0.8 }}>{a.who}</div>
                  </div>
                  <div style={{ fontSize:13, borderTop:`1px solid ${a.textColor}`, paddingTop:14, marginTop:16, opacity:0.55 }}>{a.when}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Onglet 3 : Événements ── */}
      {tab === "evenements" && (
        <section className="section" style={{ position:"relative", overflow:"hidden" }}>
          <div ref={useParallax(0.16, 90)} className="motif-bg" style={{ right:-60, top:-40, opacity:0.18 }}>
            <Motif size={380} color="var(--terra)" berryColor="var(--amber)" rotate={25} seed={2.4}/>
          </div>
          <Reveal variant="up" style={{ marginBottom:48, maxWidth:560 }}>
            <p style={{ fontSize:18, lineHeight:1.7, color:"var(--ink-soft)", textWrap:"pretty" }}>
              Rencontres avec l'équipe, restitutions publiques, ouvertures de résidences… Des moments partagés, ouverts à tous.
            </p>
          </Reveal>
          {evenements.length > 0 ? (
            <div style={{ display:"flex", flexDirection:"column" }}>
              {evenements.map((d, i) => (
                <Reveal key={i} variant="up" delay={i * 80}>
                  <div style={{ padding:"28px 0", borderTop:"1px solid var(--rule)", display:"flex", gap:32, alignItems:"flex-start" }}>
                    <div style={{ minWidth:64, textAlign:"center" }}>
                      <div className="display" style={{ fontSize:42, lineHeight:1 }}>{d.day}</div>
                      <div className="mono" style={{ fontSize:11, marginTop:4, opacity:0.55 }}>{d.month} {d.year}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"inline-block", background:d.cardColor || "var(--amber)", color:d.cardTextColor || "var(--ink)", fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"3px 10px", textTransform:"uppercase", marginBottom:10 }}>
                        {d.type}
                      </div>
                      <h3 className="display" style={{ fontSize:"clamp(20px, 2.4vw, 28px)", lineHeight:1.05, marginBottom:8 }}>{d.title}</h3>
                      <div style={{ fontSize:14, color:"var(--ink-soft)" }}>{d.venue}</div>
                      <div className="mono" style={{ fontSize:12, marginTop:6, opacity:0.55 }}>{d.time} · {d.price}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle:"italic", opacity:0.45, fontSize:18 }}>Aucun événement à venir pour le moment.</p>
          )}
        </section>
      )}

      {/* ── Onglet 4 : Ateliers ── */}
      {tab === "ateliers" && (
        <section className="section" style={{ position:"relative", overflow:"hidden" }}>
          <div ref={useParallax(0.2, 120)} className="motif-bg" style={{ left:-60, top:0, opacity:0.3 }}>
            <Motif size={380} color="var(--amber-deep)" berryColor="var(--terra)" rotate={-30} seed={3}/>
          </div>
          <Reveal variant="up" style={{ marginBottom:32, maxWidth:560 }}>
            <p style={{ fontSize:18, lineHeight:1.7, color:"var(--ink-soft)", textWrap:"pretty" }}>
              {ATELIERS.length} ateliers réguliers à la Filature de l'Isle et en quartier. Activités gratuites ou à tarif accessible. Inscriptions ouvertes pour la saison 2025–2026.
            </p>
          </Reveal>
          <div style={{ display:"flex", gap:8, marginBottom:40, flexWrap:"wrap" }}>
            {AUDIENCE_FILTERS.map(f => (
              <button key={f.id}
                className={`tweak-pill ${atelierFilter === f.id ? "active" : ""}`}
                onClick={() => { setAtelierFilter(f.id); setSelectedAtelier(null); }}
              >
                {f.label}
                {f.id !== "" && (
                  <span style={{ marginLeft:6, fontSize:10, opacity:0.65 }}>
                    {ATELIERS.filter(a => a.audience === f.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {atelierList.length === 0 ? (
            <p style={{ color:"var(--ink-soft)", fontStyle:"italic" }}>Aucun atelier dans cette catégorie pour le moment.</p>
          ) : (
            <div className="grid-3">
              {atelierList.map((a,i) => (
                <Reveal key={a.num} variant="scale" delay={(i % 3) * 80} style={{ display:"flex" }}>
                  <article className="noise" style={{ flex:1, background:a.color, color:a.textColor, padding:32, position:"relative", overflow:"hidden", minHeight:340, cursor:"pointer", display:"flex", flexDirection:"column", justifyContent:"space-between" }}
                    onClick={() => setSelectedAtelier(selectedAtelier === a.num ? null : a.num)}
                  >
                    <div style={{ position:"absolute", right:-30, bottom:-40, opacity:0.18 }}>
                      <Motif size={220} color={a.textColor} berryColor={a.textColor} rotate={20} seed={parseInt(a.num.slice(1))}/>
                    </div>
                    <div style={{ position:"relative", zIndex:2 }}>
                      <h3 className="display" style={{ fontSize:36, lineHeight:1, marginBottom:14 }}>{a.title}</h3>
                      <div style={{ fontSize:14, opacity:0.85, marginBottom:18 }}>{a.who}</div>
                      <p style={{ fontSize:14, lineHeight:1.5, opacity:0.9, textWrap:"pretty" }}>{a.desc}</p>
                    </div>
                    <div style={{ position:"relative", zIndex:2, paddingTop:24, marginTop:24, borderTop:`1px solid ${a.textColor}`, opacity:0.95 }}>
                      <div className="mono" style={{ marginBottom:6 }}>{a.when}</div>
                      <div className="mono" style={{ marginBottom:6, opacity:0.7 }}>{a.where}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:12 }}>
                        <strong style={{ fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:22 }}>{a.price}</strong>
                        <span>{selectedAtelier === a.num ? "S'inscrire ↓" : "→"}</span>
                      </div>
                      {selectedAtelier === a.num && (
                        formStates[a.num] === 'sent' ? (
                          <div onClick={e => e.stopPropagation()} style={{ marginTop:16, fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:18, opacity:0.9 }}>
                            Demande envoyée — nous revenons vers vous sous 48h.
                          </div>
                        ) : (
                          <form style={{ marginTop:16, display:"grid", gap:8 }} onClick={e => e.stopPropagation()} onSubmit={e => handleAtelierSubmit(e, a)}>
                            <input type="text" name="bot-field" style={{ display:"none" }} tabIndex="-1" autoComplete="off"/>
                            <input className="input" name="nom" placeholder="Nom" style={{ borderColor:a.textColor, color:a.textColor }} required/>
                            <input className="input" name="email" placeholder="Email" type="email" style={{ borderColor:a.textColor, color:a.textColor }} required/>
                            {formStates[a.num] === 'error' && (
                              <p style={{ fontSize:11, margin:0, opacity:0.8 }}>Erreur — réessayez ou écrivez à rouletabilletheatre@gmail.com</p>
                            )}
                            <button className="btn btn-amber" type="submit" disabled={formStates[a.num] === 'loading'} style={{ width:"100%", justifyContent:"center", opacity: formStates[a.num] === 'loading' ? 0.6 : 1 }}>
                              {formStates[a.num] === 'loading' ? 'Envoi…' : 'Envoyer la demande'}
                            </button>
                          </form>
                        )
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
};

/* ======================= FICHE SPECTACLE ======================= */
const FicheSpectacle = ({ id, setRoute, setSpectacle }) => {
  const s = SPECTACLES.find(x => x.id === id) || SPECTACLES[0];
  const dates = AGENDA.filter(a => a.spectacle === s.id);
  return (
    <>
      <section className="section" style={{ paddingBottom:40 }}>
        <button className="nav-link" onClick={() => setRoute("spectacles")} style={{ paddingLeft:0, marginBottom:24 }}>← Notre travail</button>
        <div className="col-split" style={{ gap:64, alignItems:"start" }}>
          <div className="noise" style={{ position:"relative", aspectRatio:"4/5", overflow:"hidden" }}>
            <Poster bg={s.color} ink={s.textColor} title={s.title} subtitle={s.tag} num={s.num} variant={2}/>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom:20 }}>{s.tag} · {s.duration} · {s.ages}</div>
            <h1 className="display" style={{ fontSize:"clamp(60px, 8vw, 120px)", marginBottom:32 }}>
              {s.title.split(" ").map((w,i) => i === 1 ? <span key={i} className="display-italic">{w} </span> : <span key={i}>{w} </span>)}
            </h1>
            <p style={{ fontSize:20, lineHeight:1.5, marginBottom:32, color:"var(--ink-soft)", textWrap:"pretty" }}>{s.desc}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, padding:"24px 0", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)", marginBottom:32 }}>
              <div><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Texte</div><div>{s.auteur}</div></div>
              <div><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Mise en scène</div><div>{s.mes}</div></div>
              <div style={{ gridColumn:"1 / -1" }}><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Avec</div><div>{s.with}</div></div>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button className="btn" onClick={() => setRoute("agenda")}>Voir les dates ({dates.length})</button>
              <button className="btn btn-ghost">Dossier de presse ↓</button>
            </div>
          </div>
        </div>
      </section>

      {dates.length > 0 && (
        <section className="section" style={{ background:"var(--paper-warm)" }}>
          <div className="section-head">
            <div className="section-num">Dates</div>
            <h2 className="section-title">En <span className="display-italic">tournée.</span></h2>
            <div className="section-meta">{dates.length} dates programmées</div>
          </div>
          {dates.map((d,i) => <AgendaRow key={i} d={d}/>)}
        </section>
      )}
    </>
  );
};

/* ======================= AGENDA CARD ======================= */
const TYPE_CONFIG = {
  spectacle: { label:"Spectacle", color:"var(--terra)" },
  atelier:   { label:"Atelier",   color:"var(--plum)" },
  résidence: { label:"Résidence", color:"var(--aubergine)" },
  événement: { label:"Évènement", color:"var(--amber-deep)" },
};

const STATUS_CONFIG = {
  available: { label:"Places disponibles", color:"var(--terra)" },
  few:       { label:"Dernières places",   color:"var(--amber-deep)" },
  sold:      { label:"Complet",            color:"var(--ink-soft)" },
  free:      { label:"Entrée libre",       color:"var(--plum)" },
};

const AgendaCard = ({ d, onClick }) => {
  const tc = TYPE_CONFIG[d.type] || TYPE_CONFIG.spectacle;
  const sc = STATUS_CONFIG[d.status] || STATUS_CONFIG.available;
  const spectacleData = d.spectacle ? SPECTACLES.find(s => s.id === d.spectacle) : null;

  return (
    <article
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", display:"flex", flexDirection:"column" }}
      className={onClick ? "card card-fx" : ""}
    >
      {/* Visual header */}
      <div style={{
        position:"relative", aspectRatio:"3/2", overflow:"hidden",
        background: spectacleData ? spectacleData.color : (d.cardColor || "var(--paper-warm)"),
      }}>
        {spectacleData && (
          <div style={{ position:"absolute", inset:0 }}>
            <Poster bg={spectacleData.color} ink={spectacleData.textColor} title={spectacleData.title} subtitle={spectacleData.tag} num={spectacleData.num} variant={1}/>
          </div>
        )}
        {!spectacleData && (
          <div style={{
            position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", opacity:0.18,
          }}>
            <Motif size={180} color={d.cardTextColor || "var(--paper)"} berryColor={d.cardTextColor || "var(--paper)"} rotate={15} seed={2.5}/>
          </div>
        )}
        {/* Type badge (pastille) */}
        <div style={{
          position:"absolute", top:12, left:12,
          background: tc.color, color:"#fff",
          fontSize:10, fontWeight:700, letterSpacing:"0.08em",
          padding:"4px 10px", textTransform:"uppercase",
        }}>
          {tc.label}
        </div>
      </div>

      {/* Text content — vraiment minimal */}
      <div style={{ padding:"14px 0 8px", borderTop:"1px solid var(--rule)", marginTop:0 }}>
        <h4 className="display" style={{ fontSize:20, lineHeight:1.05, marginBottom:6 }}>{d.title}</h4>
        <div style={{ fontSize:12, color:"var(--ink-soft)", marginBottom:8, letterSpacing:"0.02em" }}>
          {d.day} {d.month} {d.year} · {d.venue}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:sc.color, flexShrink:0 }}/>
          <span style={{ fontSize:11, color:sc.color, fontWeight:500 }}>{sc.label}</span>
        </div>
      </div>
    </article>
  );
};

/* ======================= AGENDA ======================= */
const AGENDA_FILTERS = [
  { id:"tout",      label:"Tout" },
  { id:"spectacle", label:"Spectacle" },
  { id:"atelier",   label:"Atelier" },
  { id:"résidence", label:"Résidence" },
  { id:"événement", label:"Évènement" },
];

const SEASON_MONTHS = [
  { key:"Sep 2025",  label:"Septembre" },
  { key:"Oct 2025",  label:"Octobre" },
  { key:"Nov 2025",  label:"Novembre" },
  { key:"Déc 2025",  label:"Décembre" },
  { key:"Jan 2026",  label:"Janvier" },
  { key:"Fév 2026",  label:"Février" },
  { key:"Mar 2026",  label:"Mars" },
  { key:"Avr 2026",  label:"Avril" },
  { key:"Mai 2026",  label:"Mai" },
  { key:"Juin 2026", label:"Juin" },
];

const Agenda = ({ setRoute, setSpectacle }) => {
  const [filter, setFilter] = useState("tout");
  const [month, setMonth] = useState("Sep 2025");

  const list = useMemo(() => {
    const base = filter === "tout" ? AGENDA : AGENDA.filter(d => d.type === filter);
    return base.filter(d => d.month + " " + d.year === month);
  }, [filter, month]);

  const countForMonth = (key) => AGENDA.filter(d => d.month + " " + d.year === key).length;

  return (
    <section className="section" style={{ position:"relative", overflow:"hidden", paddingBottom:0 }}>
      <div ref={useParallax(0.18, 110)} className="motif-bg" style={{ right:-80, top:80, opacity:0.15 }}>
        <Motif size={380} color="var(--plum)" berryColor="var(--terra)" rotate={-20} seed={2.7}/>
      </div>

      <Reveal variant="up" className="section-head">
        <div className="section-num">Saison</div>
        <h2 className="section-title">Agenda<br/><span className="display-italic">2025 — 2026.</span></h2>
        <div className="section-meta">{AGENDA.length} rendez-vous · spectacles, ateliers, résidences & événements.</div>
      </Reveal>

      {/* Barre de navigation mois — sticky sous la nav */}
      <div style={{
        position:"sticky", top:56, zIndex:20,
        background:"color-mix(in oklab, var(--paper) 96%, transparent)",
        backdropFilter:"blur(10px)",
        borderBottom:"1px solid var(--rule-strong)",
        margin:"0 calc(-1 * var(--pad-x))",
        padding:"0 var(--pad-x)",
      }}>
        <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none" }}>
          {SEASON_MONTHS.map(m => {
            const count = countForMonth(m.key);
            const active = month === m.key;
            return (
              <button key={m.key} onClick={() => setMonth(m.key)} style={{
                flexShrink:0,
                padding:"16px 20px 14px",
                background:"none", border:"none", borderBottom: active ? "2px solid var(--terra)" : "2px solid transparent",
                cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                transition:"color 0.2s, border-color 0.2s",
                color: active ? "var(--terra)" : "var(--ink-soft)",
              }}>
                <span style={{ fontFamily:"var(--ff-body)", fontSize:13, fontWeight: active ? 600 : 400, whiteSpace:"nowrap" }}>
                  {m.label}
                </span>
                <span style={{ fontFamily:"var(--ff-mono)", fontSize:10, opacity: count > 0 ? 0.6 : 0.28 }}>
                  {count > 0 ? count : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtre type + contenu */}
      <div style={{ paddingTop:40, paddingBottom:"var(--pad-y)" }}>
        <div style={{ display:"flex", gap:8, marginBottom:40, flexWrap:"wrap" }}>
          {AGENDA_FILTERS.map(f => (
            <button key={f.id}
              className={`tweak-pill ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
              style={ filter === f.id && f.id !== "tout" ? { background: TYPE_CONFIG[f.id]?.color, color:"#fff", borderColor: TYPE_CONFIG[f.id]?.color } : {} }
            >
              {f.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p style={{ fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:22, color:"var(--ink-soft)", opacity:0.5, paddingTop:24 }}>
            Aucun rendez-vous ce mois-ci.
          </p>
        ) : (
          <div className="grid-3">
            {list.map((d, i) => (
              <Reveal key={i} variant="up" delay={(i % 3) * 70}>
                <AgendaCard
                  d={d}
                  onClick={d.spectacle ? () => { setSpectacle(d.spectacle); setRoute("spectacles/detail"); } : null}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ======================= ATELIERS ======================= */
const AUDIENCE_FILTERS = [
  { id:"",         label:"Tous" },
  { id:"enfants",  label:"Enfants" },
  { id:"ados",     label:"Ados" },
  { id:"adultes",  label:"Adultes" },
  { id:"ecole",    label:"Milieu scolaire" },
  { id:"seniors",  label:"Personnes âgées" },
  { id:"quartier", label:"Quartier" },
  { id:"insertion",label:"Insertion sociale" },
];

const Ateliers = ({ audience = "" }) => {
  const [filter, setFilter] = useState(audience);
  const [selected, setSelected] = useState(null);
  const [formStates, setFormStates] = useState({}); // num -> idle | loading | sent | error

  const handleAtelierSubmit = async (e, atelier) => {
    e.preventDefault();
    e.stopPropagation();
    setFormStates(s => ({ ...s, [atelier.num]: 'loading' }));
    const fd = new FormData(e.target);
    try {
      await postForm('atelier', { atelier: atelier.title, ...Object.fromEntries(fd) });
      setFormStates(s => ({ ...s, [atelier.num]: 'sent' }));
    } catch {
      setFormStates(s => ({ ...s, [atelier.num]: 'error' }));
    }
  };

  useEffect(() => { setFilter(audience); setSelected(null); }, [audience]);

  const list = filter ? ATELIERS.filter(a => a.audience === filter) : ATELIERS;

  return (
    <>
      <section className="section" style={{ position:"relative", overflow:"hidden" }}>
        <div ref={useParallax(0.2, 120)} className="motif-bg" style={{ left:-60, top:0, opacity:0.3 }}>
          <Motif size={380} color="var(--amber-deep)" berryColor="var(--terra)" rotate={-30} seed={3}/>
        </div>
        <Reveal variant="up" className="section-head">
          <div className="section-num">Pratiques</div>
          <h2 className="section-title">Ateliers<br/><span className="display-italic">& pratiques.</span></h2>
          <div className="section-meta">{ATELIERS.length} ateliers réguliers à la Filature de l'Isle et en quartier. Activités gratuites ou à tarif accessible. Inscriptions ouvertes pour la saison 2025–2026.</div>
        </Reveal>

        {/* Filtre par public */}
        <div style={{ display:"flex", gap:8, marginBottom:40, flexWrap:"wrap" }}>
          {AUDIENCE_FILTERS.map(f => (
            <button key={f.id}
              className={`tweak-pill ${filter === f.id ? "active" : ""}`}
              onClick={() => { setFilter(f.id); setSelected(null); }}
            >
              {f.label}
              {f.id !== "" && (
                <span style={{ marginLeft:6, fontSize:10, opacity:0.65 }}>
                  {ATELIERS.filter(a => a.audience === f.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p style={{ color:"var(--ink-soft)", fontStyle:"italic" }}>Aucun atelier dans cette catégorie pour le moment.</p>
        ) : (
          <div className="grid-3">
            {list.map((a,i) => (
              <Reveal key={a.num} variant="scale" delay={(i % 3) * 80} style={{ display:"flex" }}>
              <article className="noise" style={{ flex:1, background:a.color, color:a.textColor, padding:32, position:"relative", overflow:"hidden", minHeight:340, cursor:"pointer", display:"flex", flexDirection:"column", justifyContent:"space-between" }}
                onClick={() => setSelected(selected === a.num ? null : a.num)}
              >
                <div style={{ position:"absolute", right:-30, bottom:-40, opacity:0.18 }}>
                  <Motif size={220} color={a.textColor} berryColor={a.textColor} rotate={20} seed={parseInt(a.num.slice(1))}/>
                </div>
                <div style={{ position:"relative", zIndex:2 }}>
                  <h3 className="display" style={{ fontSize:36, lineHeight:1, marginBottom:14 }}>{a.title}</h3>
                  <div style={{ fontSize:14, opacity:0.85, marginBottom:18 }}>{a.who}</div>
                  <p style={{ fontSize:14, lineHeight:1.5, opacity:0.9, textWrap:"pretty" }}>{a.desc}</p>
                </div>
                <div style={{ position:"relative", zIndex:2, paddingTop:24, marginTop:24, borderTop:`1px solid ${a.textColor}`, opacity:0.95 }}>
                  <div className="mono" style={{ marginBottom:6 }}>{a.when}</div>
                  <div className="mono" style={{ marginBottom:6, opacity:0.7 }}>{a.where}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:12 }}>
                    <strong style={{ fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:22 }}>{a.price}</strong>
                    <span>{selected === a.num ? "S'inscrire ↓" : "→"}</span>
                  </div>
                  {selected === a.num && (
                    formStates[a.num] === 'sent' ? (
                      <div onClick={e => e.stopPropagation()} style={{ marginTop:16, fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:18, opacity:0.9 }}>
                        Demande envoyée — nous revenons vers vous sous 48h.
                      </div>
                    ) : (
                      <form style={{ marginTop:16, display:"grid", gap:8 }} onClick={e => e.stopPropagation()} onSubmit={e => handleAtelierSubmit(e, a)}>
                        <input type="text" name="bot-field" style={{ display:"none" }} tabIndex="-1" autoComplete="off"/>
                        <input className="input" name="nom" placeholder="Nom" style={{ borderColor:a.textColor, color:a.textColor }} required/>
                        <input className="input" name="email" placeholder="Email" type="email" style={{ borderColor:a.textColor, color:a.textColor }} required/>
                        {formStates[a.num] === 'error' && (
                          <p style={{ fontSize:11, margin:0, opacity:0.8 }}>Erreur — réessayez ou écrivez à rouletabilletheatre@gmail.com</p>
                        )}
                        <button className="btn btn-amber" type="submit" disabled={formStates[a.num] === 'loading'} style={{ width:"100%", justifyContent:"center", opacity: formStates[a.num] === 'loading' ? 0.6 : 1 }}>
                          {formStates[a.num] === 'loading' ? 'Envoi…' : 'Envoyer la demande'}
                        </button>
                      </form>
                    )
                  )}
                </div>
              </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

/* ======================= ÉQUIPE ======================= */
const Equipe = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="section" style={{ position:"relative" }}>
      <div className="section-head">
        <div className="section-num">Équipe</div>
        <h2 className="section-title">Huit <span className="display-italic">artistes,</span><br/>une compagnie.</h2>
        <div className="section-meta">L'équipe permanente et associée de la compagnie. Survolez ou cliquez pour lire la biographie.</div>
      </div>
      <div className="col-split" style={{ gap:64, alignItems:"start" }}>
        <div>
          {EQUIPE.map((p,i) => (
            <div key={p.name}
              onClick={() => setActive(i)}
              style={{
                padding:"24px 0", borderTop:"1px solid var(--rule)", cursor:"pointer",
                opacity: active === i ? 1 : 0.6,
                transition:"opacity 0.2s, transform 0.2s",
                transform: active === i ? "translateX(8px)" : "translateX(0)"
              }}
            >
              <h3 className="display" style={{ fontSize: active === i ? 44 : 32, lineHeight:1, transition:"font-size 0.2s" }}>
                {p.name.split(" ").map((w,j) => j === 1 ? <span key={j} className="display-italic">{w} </span> : <span key={j}>{w} </span>)}
              </h3>
              <div className="mono" style={{ marginTop:8, color:"var(--terra)" }}>{p.role}</div>
            </div>
          ))}
        </div>
        <div style={{ position:"sticky", top:100 }}>
          <div className="noise" style={{ background:"var(--paper-warm)", aspectRatio:"4/5", position:"relative", overflow:"hidden", marginBottom:24 }}>
            <Poster bg={["#B84A2E","#9B7AA8","#E8B542","#3A1B2E","#8E3620","#C89420","#9B7AA8","#3A1B2E"][active] || "#B84A2E"} ink="#F4E8D5" title={EQUIPE[active].name.split(" ")[0]} subtitle={EQUIPE[active].role.split(",")[0]} num={String(active+1).padStart(2,"0")} variant={active % 4} motifOpacity={0.5}/>
          </div>
          <p style={{ fontSize:18, lineHeight:1.6, color:"var(--ink-soft)", textWrap:"pretty" }}>{EQUIPE[active].bio}</p>
        </div>
      </div>
    </section>
  );
};

/* ======================= PARTENAIRES ======================= */
const TYPE_META = {
  'Soutien institutionnel': {
    accent: 'var(--terra)',
    bg: 'var(--terra)',
    desc: "Financeurs et soutiens officiels. La Cie Rouletabille est labellisée « Lieu de fabrique » par la Région et l'Agence Culturelle de la Dordogne.",
  },
  'Partenaires artistiques': {
    accent: 'var(--plum)',
    bg: 'var(--plum)',
    desc: "Compagnies et lieux avec lesquels nous créons, co-produisons et co-diffusons en territoire.",
  },
  'Action culturelle & territoire': {
    accent: 'var(--aubergine)',
    bg: 'var(--aubergine)',
    desc: "Associations, centres sociaux et acteurs de terrain qui portent avec nous les projets de médiation culturelle en Dordogne.",
  },
  'Éducation': {
    accent: '#7A6010',
    bg: 'var(--amber)',
    desc: "Établissements scolaires et structures éducatives partenaires de nos interventions artistiques.",
  },
};

const PartnerLogo = ({ name, bg }) => {
  const initials = name.split(/[\s&–-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  return (
    <div aria-hidden="true" style={{
      width: 44, height: 44, borderRadius: '50%', background: bg, color: '#F4E8D5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--ff-display)', fontSize: 14, fontWeight: 700, flexShrink: 0,
      opacity: 0.9,
    }}>
      {initials}
    </div>
  );
};

const Partenaires = () => {
  const motifRef = useParallax(0.16, 100);
  const groups = useMemo(() => {
    const g = {};
    PARTENAIRES.forEach(p => { if (!g[p.type]) g[p.type] = []; g[p.type].push(p); });
    return g;
  }, []);

  return (
    <section className="section" style={{ position:"relative", overflow:"hidden" }}>
      <div ref={motifRef} className="motif-bg" style={{ right:-50, bottom:-100, opacity:0.3 }}>
        <Motif size={420} color="var(--terra)" berryColor="var(--amber)" rotate={180} seed={3.5}/>
      </div>
      <div className="section-head">
        <div className="section-num">Soutiens</div>
        <h2 className="section-title">Partenaires<br/><span className="display-italic">& soutiens.</span></h2>
        <div className="section-meta">Plus de 30 partenaires contribuent activement à la vie de la compagnie — institutions, artistes, associations de quartier, écoles.</div>
      </div>

      {Object.entries(groups).map(([type, list]) => {
        const meta = TYPE_META[type] || { accent:'var(--ink)', bg:'var(--ink)', desc:'' };
        return (
          <div key={type} style={{ marginBottom:64 }}>
            {/* En-tête de groupe */}
            <div style={{ display:'flex', alignItems:'flex-start', gap:24, marginBottom:32, paddingBottom:20, borderBottom:`2px solid ${meta.accent}` }}>
              <div style={{ flex:1 }}>
                <div className="eyebrow" style={{ color: meta.accent, marginBottom:8 }}>{type}</div>
                <p style={{ fontSize:14, color:'var(--ink-soft)', maxWidth:560, margin:0, lineHeight:1.6 }}>{meta.desc}</p>
              </div>
              <div className="mono" style={{ fontSize:11, color:'var(--ink-soft)', flexShrink:0, paddingTop:4 }}>
                {list.length} structure{list.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Grille des partenaires */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:2 }}>
              {list.map(p => {
                const Tag = p.url ? 'a' : 'div';
                return (
                  <Tag
                    key={p.name}
                    {...(p.url ? { href: p.url, target:'_blank', rel:'noopener noreferrer' } : {})}
                    style={{
                      display:'flex', alignItems:'center', gap:14,
                      padding:'16px 20px',
                      background:'var(--paper-warm)',
                      border:'1px solid var(--rule)',
                      textDecoration:'none', color:'inherit',
                      transition:'background 0.15s, border-color 0.15s',
                      cursor: p.url ? 'pointer' : 'default',
                    }}
                    onMouseEnter={p.url ? e => { e.currentTarget.style.background='var(--paper-deep)'; e.currentTarget.style.borderColor=meta.accent; } : undefined}
                    onMouseLeave={p.url ? e => { e.currentTarget.style.background='var(--paper-warm)'; e.currentTarget.style.borderColor='var(--rule)'; } : undefined}
                  >
                    <PartnerLogo name={p.name} bg={meta.bg} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'var(--ff-body)', fontSize:14, fontWeight:500, lineHeight:1.3 }}>{p.name}</div>
                    </div>
                    {p.url && (
                      <span style={{ fontSize:12, opacity:0.35, flexShrink:0 }}>↗</span>
                    )}
                  </Tag>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
};

/* ======================= CONTACT ======================= */
const Contact = () => {
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const motifRef = useParallax(0.18, 110);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const fd = new FormData(e.target);
    try {
      await postForm('contact', Object.fromEntries(fd));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <section className="section" style={{ position:"relative", overflow:"hidden" }}>
        <div ref={motifRef} className="motif-bg" style={{ left:-100, top:-50, opacity:0.35 }}>
          <Motif size={460} color="var(--terra)" berryColor="var(--amber)" rotate={-15} seed={4}/>
        </div>
        <div className="section-head">
          <div className="section-num">Nous joindre</div>
          <h2 className="section-title">Écrivez-<span className="display-italic">nous,</span><br/>passez nous voir.</h2>
          <div className="section-meta">Bureau ouvert du lundi au vendredi, 9h–17h. Pour les ateliers et l'action culturelle, écrivez-nous à l'adresse ci-dessous.</div>
        </div>
        <div className="col-duo" style={{ gap:80 }}>
          <div>
            <div style={{ marginBottom:32 }}>
              <div className="mono" style={{ marginBottom:8, opacity:0.5 }}>Adresse</div>
              <div style={{ fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:28, lineHeight:1.2 }}>
                Compagnie Rouletabille Théâtre<br/>
                15 ch. des feutres du Toulon<br/>
                24000 Périgueux
              </div>
            </div>
            <div style={{ marginBottom:32 }}>
              <div className="mono" style={{ marginBottom:8, opacity:0.5 }}>Contact général</div>
              <div style={{ fontSize:18, color:"var(--terra)" }}>rouletabilletheatre@gmail.com</div>
              <div style={{ fontSize:18, color:"var(--terra)" }}>www.rouletabilletheatre.com</div>
              <div className="mono" style={{ marginTop:8 }}>06 95 60 34 89</div>
              <div className="mono">05 53 06 07 45</div>
            </div>
            <div style={{ marginBottom:32 }}>
              <div className="mono" style={{ marginBottom:8, opacity:0.5 }}>Horaires bureau</div>
              <div style={{ fontSize:16, lineHeight:1.7 }}>Lundi – Vendredi : 9h–17h</div>
            </div>
            <div>
              <div className="mono" style={{ marginBottom:8, opacity:0.5 }}>Accès</div>
              <div style={{ fontSize:14, lineHeight:1.7, color:"var(--ink-soft)" }}>
                Vélo · Points d'accroche autour de la Filature de l'Isle<br/>
                Bus · « Salle Omnisports » (ligne A) ou « Privilège » (ligne e1)<br/>
                Voiture · Parking autour de la Filature de l'Isle<br/>
                Accessibilité · Rampe d'accès mobilité réduite disponible
              </div>
            </div>
          </div>
          <div>
            {status === 'sent' ? (
              <div style={{ padding:48, background:"var(--amber)", color:"var(--ink)" }}>
                <h3 className="display" style={{ fontSize:48, marginBottom:12 }}>Merci.</h3>
                <p>Votre message est arrivé. Nous revenons vers vous sous 48h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"grid", gap:16 }}>
                <input type="text" name="bot-field" style={{ display:"none" }} tabIndex="-1" autoComplete="off"/>
                <div className="grid-2" style={{ gap:16 }}>
                  <input className="input" name="nom" placeholder="Nom" required/>
                  <input className="input" name="email" placeholder="Email" type="email" required/>
                </div>
                <select className="input" name="objet" required defaultValue="">
                  <option value="" disabled>Objet du message</option>
                  <option>Information spectacle</option>
                  <option>Inscription atelier</option>
                  <option>Diffusion / Programmation</option>
                  <option>Presse</option>
                  <option>Autre</option>
                </select>
                <textarea className="textarea" name="message" rows={8} placeholder="Votre message" required/>
                {status === 'error' && (
                  <p style={{ fontSize:13, color:"var(--terra)", margin:0 }}>
                    Une erreur est survenue. Réessayez ou écrivez directement à <strong>rouletabilletheatre@gmail.com</strong>
                  </p>
                )}
                <button className="btn" type="submit" disabled={status === 'loading'} style={{ justifySelf:"start", opacity: status === 'loading' ? 0.6 : 1 }}>
                  {status === 'loading' ? 'Envoi en cours…' : 'Envoyer →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      <Newsletter/>
    </>
  );
};

/* ======================= NEWSLETTER ======================= */
const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await postForm('newsletter', { email });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section" style={{ background:"var(--amber)", color:"var(--ink)", paddingTop:64, paddingBottom:64 }}>
      <div className="col-newsletter">
        <h2 className="display" style={{ fontSize:"clamp(40px, 5vw, 72px)" }}>
          La saison<br/><span className="display-italic">par lettre.</span>
        </h2>
        <div>
          <p style={{ fontSize:18, marginBottom:24, maxWidth:480 }}>Une lettre par mois. Les nouvelles dates, les coulisses des créations, les ateliers à venir. Pas de spam, promis.</p>
          {status === 'done' ? (
            <div className="display-italic" style={{ fontSize:32 }}>Inscrit. À très vite ✦</div>
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display:"flex", gap:8, maxWidth:520 }}>
                <input type="text" name="bot-field" style={{ display:"none" }} tabIndex="-1" autoComplete="off"/>
                <input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.fr" style={{ background:"transparent", borderColor:"var(--ink)", flex:1 }}/>
                <button className="btn" type="submit" disabled={status === 'loading'} style={{ opacity: status === 'loading' ? 0.6 : 1 }}>
                  {status === 'loading' ? '…' : "S'inscrire →"}
                </button>
              </form>
              {status === 'error' && (
                <p style={{ fontSize:13, marginTop:10, opacity:0.7 }}>
                  Une erreur est survenue. Réessayez dans un instant.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

/* ======================= FOOTER ======================= */
const Footer = ({ setRoute }) => (
  <footer className="footer">
    <div className="col-footer" style={{ marginBottom:48 }}>
      <div>
        <div className="nav-logo" style={{ color:"var(--paper)", fontSize:32, marginBottom:16 }}>
          <MotifMark size={36} color="var(--paper)"/>
          <span>Cie Rouletabille</span>
        </div>
        <p style={{ opacity:0.7, fontSize:14, lineHeight:1.6, maxWidth:340 }}>Compagnie de théâtre fondée en 1993 à Périgueux. Labellisée « Lieu de fabrique » Région Nouvelle-Aquitaine.</p>
      </div>
      <div>
        <div className="mono" style={{ marginBottom:14, opacity:0.5 }}>Découvrir</div>
        <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:14 }}>
          <li onClick={() => setRoute("spectacles")} style={{ cursor:"pointer" }}>Spectacles</li>
          <li onClick={() => setRoute("agenda")} style={{ cursor:"pointer" }}>Agenda</li>
          <li onClick={() => setRoute("ateliers")} style={{ cursor:"pointer" }}>Ateliers</li>
          <li onClick={() => setRoute("equipe")} style={{ cursor:"pointer" }}>Équipe</li>
        </ul>
      </div>
      <div>
        <div className="mono" style={{ marginBottom:14, opacity:0.5 }}>Pratique</div>
        <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:14 }}>
          <li onClick={() => setRoute("contact")} style={{ cursor:"pointer" }}>Contact</li>
          <li onClick={() => setRoute("contact")} style={{ cursor:"pointer" }}>Venir à l'atelier</li>
          <li><a href="mailto:rouletabilletheatre@gmail.com?subject=Demande%20de%20dossier%20de%20presse" style={{ color:"inherit", textDecoration:"none" }}>Dossiers de presse</a></li>
          <li onClick={() => setRoute("contact")} style={{ cursor:"pointer" }}>Mentions légales</li>
        </ul>
      </div>
      <div>
        <div className="mono" style={{ marginBottom:14, opacity:0.5 }}>Suivre</div>
        <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:14 }}>
          <li><a href="https://www.instagram.com/rouletabilletheatre" target="_blank" rel="noopener" style={{ color:"inherit", textDecoration:"none" }}>Instagram</a></li>
          <li>Facebook</li>
          <li>HelloAsso</li>
          <li onClick={() => {}} style={{ cursor:"pointer" }}>Newsletter</li>
        </ul>
      </div>
    </div>
    <div style={{ borderTop:"1px solid color-mix(in oklab, var(--paper) 20%, transparent)", paddingTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, fontSize:12, opacity:0.6 }}>
      <span>© 2025 Compagnie Rouletabille Théâtre — Tous droits réservés</span>
      <span>Saison 2025 — 2026 · Périgueux</span>
    </div>
  </footer>
);

export { Nav, Home, Spectacles, FicheSpectacle, Agenda, Ateliers, Equipe, Partenaires, Contact, Footer };
