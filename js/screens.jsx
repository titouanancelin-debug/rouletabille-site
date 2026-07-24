/* Écrans : Home, Spectacles, FicheSpectacle, Agenda, Ateliers, Équipe, Partenaires, Contact */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Motif, MotifHero, MotifMark, Poster } from './motif.jsx';
import { useContent } from './content-context.jsx';
import { RichText, SectionsLibres } from './rich-content.jsx';
import { prefersReduced, Reveal, KineticTitle, useParallax } from './fx.jsx';

/* ─── Formulaires : Cloudflare Pages Functions ─────────────────────────────
   Chaque formulaire poste en JSON vers /api/<nom> (voir functions/api/),
   qui envoie l'email via Resend. Le champ caché "bot-field" sert de
   honeypot anti-spam, vérifié côté fonction.
   ─────────────────────────────────────────────────────────────────────── */
async function postForm(formName, data) {
  const res = await fetch(`/api/${formName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('http_error');
}

/* Photo réelle pour remplacer un visuel généré (affiche, pastille couleur,
   initiales...) quand elle est renseignée sur l'item. */
const CardPhoto = ({ item, alt, style }) => (
  <img
    src={item.image}
    alt={alt || ""}
    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }}
  />
);

/* Italicise le dernier mot d'une ligne de titre éditable (garde l'accent
   typographique du site sans figer un découpage mot-à-mot en dur). */
const italicLastWord = (text) => {
  const words = (text || "").trim().split(" ");
  if (words.length === 0) return null;
  const last = words.pop();
  return <>{words.length ? words.join(" ") + " " : ""}<span className="display-italic">{last}</span></>;
};

/* ======================= NAV ======================= */
const toPath = (id) => (id === "home" ? "/" : "/" + id);

/* Les entrées d'agenda n'ont pas d'identifiant unique (contrairement aux
   spectacles) — le slug est dérivé du titre + de la date, ce qui est stable
   tant que ces champs ne changent pas et fonctionne aussi bien pour les
   entrées JSON que pour les occurrences d'ateliers générées à la volée. */
const slugify = (s) => (s || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const agendaSlug = (d) => slugify(`${d.title || ""}-${d.day || ""}-${d.month || ""}-${d.year || ""}`);

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

const Nav = ({ route }) => {
  const { MENU } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { id:"home", label:MENU.labelHome },
    { id:"spectacles", label:MENU.labelSpectacles },
    { id:"agenda", label:MENU.labelAgenda },
    { id:"equipe", label:MENU.labelEquipe },
    { id:"partenaires", label:MENU.labelPartenaires },
    { id:"contact", label:MENU.labelContact },
  ];

  return (
    <nav className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <Link to="/" className="nav-logo" style={{ textDecoration:"none" }}>
        <MotifMark size={32} color="var(--terra)"/>
        <span style={{ display:"flex", flexDirection:"column", lineHeight:1 }}>
          <span>Rouletabille</span>
          <span style={{ fontSize:11, fontFamily:"var(--ff-display)", fontStyle:"italic", opacity:0.55, marginTop:3, lineHeight:1.3 }}>Fabrique artistique<br/>et culturelle</span>
        </span>
      </Link>
      <div className="nav-menu">
        {items.map(it => (
          <Link key={it.id} to={toPath(it.id)} className={`nav-link ${route.startsWith(it.id) ? "active" : ""}`}>
            {it.label}
          </Link>
        ))}
        <Link to="/archives" className={`nav-link ${route.startsWith("archives") ? "active" : ""}`}>Archives</Link>
      </div>

      {/* Hamburger — mobile only */}
      <button className={`nav-burger ${mobileOpen ? "is-open" : ""}`} onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
        <span/><span/><span/>
      </button>

      {/* Overlay mobile */}
      <div className={`nav-mobile ${mobileOpen ? "open" : ""}`}>
        {items.map(it => (
          <Link key={it.id} to={toPath(it.id)} className={`nav-mobile-link ${route.startsWith(it.id) ? "active" : ""}`} onClick={() => setMobileOpen(false)} style={{ textDecoration:"none" }}>
            {it.label}
          </Link>
        ))}
        <Link to="/archives" className={`nav-mobile-link ${route.startsWith("archives") ? "active" : ""}`} style={{ textDecoration:"none" }} onClick={() => setMobileOpen(false)}>Archives</Link>
      </div>
    </nav>
  );
};

/* ======================= BOTANIC HERO ======================= */
const BotanicHero = ({ setRoute }) => {
  const { HOME } = useContent();
  return (
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
          {HOME.heroEyebrow}
        </div>
      </Reveal>

      <h1 className="display" style={{
        fontSize: "clamp(54px, 6.5vw, 108px)",
        lineHeight: 0.96,
        marginBottom: 32,
        color: "var(--paper)",
      }}>
        <KineticTitle lineDelay={110} baseDelay={160} lines={[
          italicLastWord(HOME.heroLine1),
          italicLastWord(HOME.heroLine2),
        ]}/>
      </h1>

      <Reveal variant="up" delay={520} as="div" style={{
        fontSize: 18,
        lineHeight: 1.65,
        color: "color-mix(in oklab, var(--paper) 78%, transparent)",
        maxWidth: 440,
        marginBottom: 40,
        textWrap: "pretty",
      }}>
        <RichText content={HOME.heroIntro}/>
      </Reveal>

      <Reveal variant="up" delay={640} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="btn btn-amber" onClick={() => setRoute("spectacles")}>
          Voir notre travail →
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
        <span style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", textTransform: "none" }}>{HOME.heroTagline}</span>
      </Reveal>
    </div>

    {/* Scroll cue */}
    <div className="scroll-cue">
      <span>Défiler</span>
      <span className="cue-rail"><span className="cue-dot"/></span>
    </div>
  </section>
  );
};

/* ======================= SCROLL EXPAND HERO ======================= */
const ScrollExpandHero = ({ setRoute }) => {
  const { HOME } = useContent();
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
                    {HOME.heroEyebrow}
                  </div>
                </Reveal>
                <h1 className="display" style={{ fontSize: "clamp(54px, 6.5vw, 108px)", lineHeight: 0.96, marginBottom: 32, color: "var(--paper)" }}>
                  <KineticTitle lineDelay={110} baseDelay={160} lines={[
                    italicLastWord(HOME.heroLine1),
                    italicLastWord(HOME.heroLine2),
                  ]}/>
                </h1>
                <Reveal variant="up" delay={520} as="div" style={{ fontSize: 18, lineHeight: 1.65, color: "color-mix(in oklab, var(--paper) 78%, transparent)", maxWidth: 440, margin: "0 auto 40px", textWrap: "pretty" }}>
                  <RichText content={HOME.heroIntro}/>
                </Reveal>
                <Reveal variant="up" delay={640} style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                  <button className="btn btn-amber" onClick={() => setRoute("spectacles")}>Voir notre travail →</button>
                  <button className="btn btn-ghost" onClick={() => setRoute("agenda")} style={{ color: "var(--paper)", borderColor: "color-mix(in oklab, var(--paper) 35%, transparent)" }}>Voir l'agenda</button>
                </Reveal>
                <Reveal variant="fade" delay={900} style={{ marginTop: 56, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, color: "color-mix(in oklab, var(--paper) 36%, transparent)", fontSize: 11, letterSpacing: "0.1em", fontFamily: "var(--ff-mono)", textTransform: "uppercase" }}>
                  <span style={{ display: "block", width: 32, height: "1px", background: "currentColor", flexShrink: 0 }}/>
                  <span style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", textTransform: "none" }}>{HOME.heroTagline}</span>
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
            fontSize: "clamp(20px, 3.1vw, 50px)", color: "var(--paper)", lineHeight: 1.05,
            transform: `translateX(${textShift}vw)`,
            willChange: "transform",
            mixBlendMode: "difference",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}>fabrique artistique<br/>et culturelle</span>
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
const HistoireAccordion = () => {
  const { HOME } = useContent();
  const [open, setOpen] = useState(null);
  return (
    <div style={{ borderTop:"1px solid var(--rule)" }}>
      {HOME.histoire.map((s, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} style={{ borderBottom:"1px solid var(--rule)" }}>
            <button
              onClick={() => setOpen(isOpen ? null : idx)}
              style={{
                width:"100%", textAlign:"left", background:"none", border:"none", cursor:"pointer",
                padding:"28px 0", display:"grid", gridTemplateColumns:"40px 1fr auto", gap:24, alignItems:"start",
                transition:"color 0.2s",
              }}
              aria-expanded={isOpen}
            >
              <span className="mono" style={{ fontSize:11, opacity:0.45, paddingTop:6 }}>{String(idx + 1).padStart(2, "0")}</span>
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
                <RichText content={s.texte} style={{
                  fontSize:16, lineHeight:1.75, color:"var(--ink-soft)", textWrap:"pretty",
                }}/>
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

const getFeaturedEvents = (AGENDA) => {
  const seen = new Set();
  const today = new Date(); today.setHours(0,0,0,0);
  return AGENDA
    .filter(d => {
      if (!d.type?.some(t => ["spectacle","événement","résidence"].includes(t))) return false;
      const key = d.spectacle ?? d.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(d => ({ d, date: new Date(+d.year, FR_MONTHS_IDX[d.month] ?? 0, +d.day) }))
    .filter(({ date }) => date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 6)
    .map(({ d }) => d);
};

const TYPE_LABEL = { spectacle:"Spectacle", événement:"Événement", résidence:"Résidence", médiation:"Médiation", atelier:"Atelier", "projet de territoire":"Projet de territoire" };
/* Un rendez-vous d'agenda peut cocher plusieurs types (ex: atelier + médiation) — on affiche tous les libellés correspondants. */
const typeLabels = (type) => (type || []).map(t => TYPE_LABEL[t] || t).join(" · ");

const EventCard = ({ item, setRoute }) => {
  const { SPECTACLES } = useContent();
  const sp = item.spectacle ? SPECTACLES.find(s => s.id === item.spectacle) : null;
  const spIdx = sp ? SPECTACLES.findIndex(s => s.id === item.spectacle) : 0;
  const ink = item.cardTextColor || "var(--paper)";

  const handleClick = () => setRoute("agenda/" + agendaSlug(item));

  return (
    <article onClick={handleClick} style={{ cursor:"pointer" }}>
      <div className="card-fx" style={{ aspectRatio:"3/4", position:"relative", overflow:"hidden" }}>
        {sp ? (
          <>
            {sp.image ? <CardPhoto item={sp} alt={sp.title} style={{ position:"absolute", inset:0 }}/> : <Poster bg={sp.color} ink={sp.textColor} title={sp.title} subtitle={sp.tag} num={sp.num} variant={spIdx % 4}/>}
            <div style={{
              position:"absolute", bottom:0, left:0, right:0,
              background:"linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)",
              padding:"52px 18px 18px", color:"#fff",
            }}>
              {sp.image && <h3 className="display" style={{ fontSize:"clamp(20px, 2.4vw, 28px)", lineHeight:1.05, marginBottom:8 }}>{sp.title}</h3>}
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:11, marginBottom:4, opacity:0.78 }}>{item.venue}</div>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:11, opacity:0.58 }}>{item.time} · {item.price}</div>
            </div>
          </>
        ) : item.image ? (
          <>
            <CardPhoto item={item} alt={item.title} style={{ position:"absolute", inset:0 }}/>
            <div style={{
              position:"absolute", inset:0,
              background:"linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 55%)",
              padding:28, color:"#fff",
              display:"flex", flexDirection:"column", justifyContent:"space-between",
            }}>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:9, fontWeight:700, letterSpacing:"0.12em", padding:"3px 10px", border:"1px solid #fff", display:"inline-block", alignSelf:"start", opacity:0.85, textTransform:"uppercase" }}>
                {typeLabels(item.type)}
              </div>
              <div>
                <h3 className="display" style={{ fontSize:"clamp(22px, 2.8vw, 34px)", lineHeight:1.02, marginBottom:8 }}>{item.title}</h3>
                <div style={{ fontFamily:"var(--ff-mono)", fontSize:12, marginBottom:4, opacity:0.78 }}>{item.venue}</div>
                <div style={{ fontFamily:"var(--ff-mono)", fontSize:12, opacity:0.6 }}>{item.time} · {item.price}</div>
              </div>
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
                {typeLabels(item.type)}
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
          {item.day} {item.month} · {typeLabels(item.type)}
        </div>
        <h4 className="display" style={{ fontSize:"clamp(14px, 1.3vw, 17px)", lineHeight:1.1 }}>
          {sp?.title || item.title}<span className="card-arrow">→</span>
        </h4>
      </div>
    </article>
  );
};

const EventCarousel = ({ setRoute }) => {
  const { AGENDA } = useContent();
  const items = useMemo(() => getFeaturedEvents(AGENDA), [AGENDA]);
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
              <EventCard item={item} setRoute={setRoute}/>
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
const Home = ({ setRoute }) => {
  const { HOME } = useContent();
  return (
  <>
    <ScrollExpandHero setRoute={setRoute}/>

    <SectionsLibres doc={{ sections: HOME.sectionsHaut }}/>

    {/* ÉVÉNEMENTS CAROUSEL */}
    <section className="section">
      <Reveal variant="up" className="section-head" style={{ marginBottom:40 }}>
        <div className="section-num">Au programme</div>
        <h2 className="section-title">Prochains<br/><span className="display-italic">rendez-vous.</span></h2>
        <div className="section-meta">Spectacles, résidences et événements de la saison. <a className="link-underline" onClick={() => setRoute("agenda")}>Calendrier complet →</a></div>
      </Reveal>
      <EventCarousel setRoute={setRoute}/>
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
          <div className="mono" style={{ marginBottom:16, color:"color-mix(in oklab, var(--paper) 65%, transparent)" }}>{HOME.aboutTag}</div>
          <h2 className="display" style={{ fontSize:"clamp(48px, 6vw, 84px)" }}>
            {italicLastWord(HOME.aboutTitle)}
          </h2>
        </Reveal>
        <Reveal variant="right" delay={120}>
          <RichText content={HOME.aboutTexte} style={{
            fontSize:18, lineHeight:1.6, color:"color-mix(in oklab, var(--paper) 88%, transparent)",
            marginBottom:32, textWrap:"pretty",
          }}/>
          <button className="btn btn-amber" onClick={() => setRoute("equipe")}>Rencontrer l'équipe →</button>
        </Reveal>
      </div>
    </section>

    {/* PUBLICS */}
    <section className="section">
      <Reveal variant="up" className="section-head" style={{ marginBottom:40 }}>
        <div className="section-num">Publics</div>
        <h2 className="section-title">Un lieu ouvert <span className="display-italic">à toutes et tous.</span></h2>
        <RichText content={HOME.publicsIntro} className="section-meta"/>
      </Reveal>
      <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
        {["Enfants","Jeunes","Adultes","Habitants","Professionnels","Amateurs","Écoles","Structures sociales et médico-sociales","Collectivités"].map(label => (
          <span key={label} className="mono" style={{
            padding:"10px 20px", border:"1px solid var(--rule)", borderRadius:999,
            color:"var(--ink-soft)",
          }}>{label}</span>
        ))}
      </div>
    </section>

    {/* SECTIONS LIBRES — blocs composables depuis Sanity Studio */}
    <SectionsLibres doc={HOME}/>

    {/* NEWSLETTER */}
    <Newsletter/>
  </>
  );
};

/* ======================= SPECTACLE CARD ======================= */
const SpectacleCard = ({ s, variant=0, onClick }) => (
  <article className="card card-fx" onClick={onClick} style={{ cursor:"pointer", background:"transparent", border:"none" }}>
    <div className="card-img noise" style={{ aspectRatio:"4/5", position:"relative", overflow:"hidden" }}>
      {s.image ? <CardPhoto item={s} alt={s.title}/> : <Poster bg={s.color} ink={s.textColor} title={s.title} subtitle={s.tag} num={s.num} variant={variant}/>}
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
  { id:"ateliers",    label:"Ateliers réguliers",     num:"02", title:"Ateliers & pratique",       sub:"Pratiques artistiques régulières, stages et cycles." },
  { id:"evenements",  label:"Événements",              num:"03", title:"Événements",                sub:"Rencontres, restitutions et rendez-vous ouverts." },
  { id:"mediations",  label:"Médiations",             num:"04", title:"Médiations & pratiques",   sub:"Ateliers, transmissions, actions de territoire." },
  { id:"territoire",  label:"Projets de territoire",   num:"05", title:"Projets de territoire",     sub:"Des espaces de convergence construits avec les habitants et le territoire, sur le long cours." },
];

const Spectacles = ({ setRoute }) => {
  const { AGENDA, SPECTACLES_SECTIONS, SPECTACLES_SECTIONS_HAUT } = useContent();
  const [tab, setTab] = useState("residences");
  const [atelierFilter, setAtelierFilter] = useState("");
  const [selectedAtelier, setSelectedAtelier] = useState(null);
  const [formStates, setFormStates] = useState({});
  const residences = AGENDA.filter(d => d.type?.includes("résidence"));
  const mediations  = AGENDA.filter(d => d.type?.includes("médiation"));
  const evenements  = AGENDA.filter(d => d.type?.includes("événement"));
  const ateliersAgenda = AGENDA.filter(d => d.type?.includes("atelier"));
  const territoire  = AGENDA.filter(d => d.type?.includes("projet de territoire"));

  const handleAtelierSubmit = async (e, atelier) => {
    e.preventDefault();
    e.stopPropagation();
    const key = agendaSlug(atelier);
    setFormStates(s => ({ ...s, [key]: 'loading' }));
    const fd = new FormData(e.target);
    try {
      await postForm('atelier', { atelier: atelier.title, ...Object.fromEntries(fd) });
      setFormStates(s => ({ ...s, [key]: 'sent' }));
    } catch {
      setFormStates(s => ({ ...s, [key]: 'error' }));
    }
  };

  const atelierList = atelierFilter ? ateliersAgenda.filter(a => a.audience === atelierFilter) : ateliersAgenda;

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

      <SectionsLibres doc={{ sections: SPECTACLES_SECTIONS_HAUT }}/>

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
                  <div className="card-fx" style={{ border:"1px solid rgba(242,228,200,0.15)", cursor:"pointer" }} onClick={() => setRoute("agenda/" + agendaSlug(d))}>
                    {d.image && (
                      <div style={{ position:"relative", aspectRatio:"16/9", overflow:"hidden" }}>
                        <CardPhoto item={d} alt={d.title}/>
                      </div>
                    )}
                    <div style={{ padding:32 }}>
                    <div style={{ display:"inline-block", background:"var(--plum)", color:"#fff", fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"4px 10px", textTransform:"uppercase", marginBottom:24 }}>Résidence</div>
                    <h3 className="display" style={{ fontSize:"clamp(24px, 3vw, 36px)", marginBottom:12, lineHeight:1.05 }}>{d.title}<span className="card-arrow">→</span></h3>
                    <div className="mono" style={{ opacity:0.5, marginBottom:6 }}>{d.day} {d.month} {d.year}</div>
                    <div style={{ fontSize:14, opacity:0.7, marginBottom:12 }}>{d.venue}</div>
                    <div style={{ fontSize:13, opacity:0.5, fontStyle:"italic", marginBottom: d.desc ? 16 : 0 }}>{d.price}</div>
                    {d.desc && <RichText content={d.desc} style={{ fontSize:14, lineHeight:1.6, color:"rgba(242,228,200,0.8)" }}/>}
                    </div>
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
              La transmission artistique est une activité centrale, pas accessoire. Interventions scolaires, actions de territoire, médiation culturelle.
            </p>
          </Reveal>
          {mediations.length > 0 ? (
            <div className="grid-2">
              {mediations.map((d, i) => (
                <Reveal key={i} variant="up" delay={i * 100}>
                  <div className="card-fx" style={{ border:"1px solid var(--rule)", cursor:"pointer" }} onClick={() => setRoute("agenda/" + agendaSlug(d))}>
                    {d.image && (
                      <div style={{ position:"relative", aspectRatio:"16/9", overflow:"hidden" }}>
                        <CardPhoto item={d} alt={d.title}/>
                      </div>
                    )}
                    <div style={{ padding:32 }}>
                      <div style={{ display:"inline-block", background:"var(--amber-deep)", color:"#fff", fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"4px 10px", textTransform:"uppercase", marginBottom:24 }}>Médiation</div>
                      <h3 className="display" style={{ fontSize:"clamp(24px, 3vw, 36px)", marginBottom:12, lineHeight:1.05 }}>{d.title}<span className="card-arrow">→</span></h3>
                      <div className="mono" style={{ opacity:0.5, marginBottom:6 }}>{d.day} {d.month} {d.year}</div>
                      <div style={{ fontSize:14, opacity:0.7, marginBottom: d.desc ? 16 : 0, color:"var(--ink-soft)" }}>{d.venue}</div>
                      {d.desc && <RichText content={d.desc} style={{ fontSize:14, lineHeight:1.6, color:"var(--ink-soft)" }}/>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle:"italic", opacity:0.45, fontSize:18 }}>Aucune médiation programmée pour le moment.</p>
          )}
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
                  <div className="card-fx" style={{ padding:"28px 0", borderTop:"1px solid var(--rule)", display:"flex", gap:32, alignItems:"flex-start", cursor:"pointer" }} onClick={() => setRoute("agenda/" + agendaSlug(d))}>
                    <div style={{ minWidth:64, textAlign:"center" }}>
                      <div className="display" style={{ fontSize:42, lineHeight:1 }}>{d.day}</div>
                      <div className="mono" style={{ fontSize:11, marginTop:4, opacity:0.55 }}>{d.month} {d.year}</div>
                    </div>
                    {d.image && (
                      <div style={{ width:120, aspectRatio:"4/3", position:"relative", overflow:"hidden", flexShrink:0 }}>
                        <CardPhoto item={d} alt={d.title}/>
                      </div>
                    )}
                    <div style={{ flex:1 }}>
                      <div style={{ display:"inline-block", background:d.cardColor || "var(--amber)", color:d.cardTextColor || "var(--ink)", fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"3px 10px", textTransform:"uppercase", marginBottom:10 }}>
                        {typeLabels(d.type)}
                      </div>
                      <h3 className="display" style={{ fontSize:"clamp(20px, 2.4vw, 28px)", lineHeight:1.05, marginBottom:8 }}>{d.title}<span className="card-arrow">→</span></h3>
                      <div style={{ fontSize:14, color:"var(--ink-soft)" }}>{d.venue}</div>
                      <div className="mono" style={{ fontSize:12, marginTop:6, opacity:0.55 }}>{d.time} · {d.price}</div>
                      {d.desc && <RichText content={d.desc} style={{ fontSize:14, lineHeight:1.6, color:"var(--ink-soft)", marginTop:12 }}/>}
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

      {/* ── Onglet 5 : Projets de territoire ── */}
      {tab === "territoire" && (
        <section className="section" style={{ background:"var(--aubergine)", color:"var(--paper)", position:"relative", overflow:"hidden", minHeight:"60vh" }}>
          <div ref={useParallax(0.18, 100)} className="motif-bg" style={{ right:-80, bottom:-60, opacity:0.3 }}>
            <Motif size={460} color="var(--paper)" berryColor="var(--amber)" rotate={15} seed={5.2}/>
          </div>
          <Reveal variant="up" style={{ marginBottom:48, maxWidth:640 }}>
            <p style={{ fontSize:18, lineHeight:1.7, color:"rgba(242,228,200,0.75)", textWrap:"pretty" }}>
              Des projets artistiques et culturels co-construits avec les habitants, les partenaires et les structures d'un territoire, sur le temps long.
            </p>
          </Reveal>
          {territoire.length > 0 ? (
            <div className="grid-2">
              {territoire.map((d, i) => (
                <Reveal key={i} variant="up" delay={i * 100}>
                  <div className="card-fx" style={{ border:"1px solid rgba(242,228,200,0.15)", cursor:"pointer" }} onClick={() => setRoute("agenda/" + agendaSlug(d))}>
                    {d.image && (
                      <div style={{ position:"relative", aspectRatio:"16/9", overflow:"hidden" }}>
                        <CardPhoto item={d} alt={d.title}/>
                      </div>
                    )}
                    <div style={{ padding:32 }}>
                    <div style={{ display:"inline-block", background:"var(--amber-deep)", color:"#fff", fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"4px 10px", textTransform:"uppercase", marginBottom:24 }}>Projet de territoire</div>
                    <h3 className="display" style={{ fontSize:"clamp(24px, 3vw, 36px)", marginBottom:12, lineHeight:1.05 }}>{d.title}<span className="card-arrow">→</span></h3>
                    <div className="mono" style={{ opacity:0.5, marginBottom:6 }}>{d.time}</div>
                    <div style={{ fontSize:14, opacity:0.7, marginBottom:12 }}>{d.venue}</div>
                    {d.desc && <RichText content={d.desc} style={{ fontSize:14, lineHeight:1.6, color:"rgba(242,228,200,0.8)" }}/>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle:"italic", opacity:0.45, fontSize:18 }}>Aucun projet de territoire en cours actuellement.</p>
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
              Ateliers réguliers à la Filature de l'Isle et en quartier. Activités gratuites ou à tarif accessible. Inscriptions ouvertes.
            </p>
          </Reveal>
          <div style={{ display:"flex", gap:8, marginBottom:40, flexWrap:"wrap" }}>
            {AUDIENCE_FILTERS.map(f => (
              <button key={f.id}
                className={`tweak-pill ${atelierFilter === f.id ? "active" : ""}`}
                onClick={() => { setAtelierFilter(f.id); setSelectedAtelier(null); }}
              >
                {f.label}
              </button>
            ))}
          </div>
          {atelierList.length === 0 ? (
            <p style={{ color:"var(--ink-soft)", fontStyle:"italic" }}>Aucun atelier dans cette catégorie pour le moment.</p>
          ) : (
            <div className="grid-3">
              {atelierList.map((a,i) => {
                const key = agendaSlug(a);
                return (
                <Reveal key={key} variant="scale" delay={(i % 3) * 80} style={{ display:"flex" }}>
                  <article className={a.image ? "" : "noise"} style={{ flex:1, background: a.image ? "#000" : a.cardColor, color:a.cardTextColor, padding:32, position:"relative", overflow:"hidden", minHeight:340, cursor:"pointer", display:"flex", flexDirection:"column", justifyContent:"space-between" }}
                    onClick={() => setSelectedAtelier(selectedAtelier === key ? null : key)}
                  >
                    {a.image ? (
                      <>
                        <CardPhoto item={a} alt={a.title} style={{ position:"absolute", inset:0, opacity:0.5 }}/>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))" }}/>
                      </>
                    ) : (
                      <div style={{ position:"absolute", right:-30, bottom:-40, opacity:0.18 }}>
                        <Motif size={220} color={a.cardTextColor} berryColor={a.cardTextColor} rotate={20} seed={i+1}/>
                      </div>
                    )}
                    <div style={{ position:"relative", zIndex:2 }}>
                      <h3 className="display" style={{ fontSize:36, lineHeight:1, marginBottom:14 }}>{a.title}</h3>
                      <div style={{ fontSize:14, opacity:0.85, marginBottom:18 }}>{a.who}</div>
                      <RichText content={a.desc} style={{ fontSize:14, lineHeight:1.5, opacity:0.9, textWrap:"pretty" }}/>
                    </div>
                    <div style={{ position:"relative", zIndex:2, paddingTop:24, marginTop:24, borderTop:`1px solid ${a.cardTextColor}`, opacity:0.95 }}>
                      <div className="mono" style={{ marginBottom:6 }}>{a.time}</div>
                      <div className="mono" style={{ marginBottom:6, opacity:0.7 }}>{a.venue}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:12 }}>
                        <strong style={{ fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:22 }}>{a.price}</strong>
                        <span>{selectedAtelier === key ? "S'inscrire ↓" : "→"}</span>
                      </div>
                      {selectedAtelier === key && (
                        formStates[key] === 'sent' ? (
                          <div onClick={e => e.stopPropagation()} style={{ marginTop:16, fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:18, opacity:0.9 }}>
                            Demande envoyée — nous revenons vers vous sous 48h.
                          </div>
                        ) : (
                          <form style={{ marginTop:16, display:"grid", gap:8 }} onClick={e => e.stopPropagation()} onSubmit={e => handleAtelierSubmit(e, a)}>
                            <input type="text" name="bot-field" style={{ display:"none" }} tabIndex="-1" autoComplete="off"/>
                            <input className="input" name="nom" placeholder="Nom" style={{ borderColor:a.cardTextColor, color:a.cardTextColor }} required/>
                            <input className="input" name="email" placeholder="Email" type="email" style={{ borderColor:a.cardTextColor, color:a.cardTextColor }} required/>
                            {formStates[key] === 'error' && (
                              <p style={{ fontSize:11, margin:0, opacity:0.8 }}>Erreur — réessayez ou écrivez à rouletabilletheatre@gmail.com</p>
                            )}
                            <button className="btn btn-amber" type="submit" disabled={formStates[key] === 'loading'} style={{ width:"100%", justifyContent:"center", opacity: formStates[key] === 'loading' ? 0.6 : 1 }}>
                              {formStates[key] === 'loading' ? 'Envoi…' : 'Envoyer la demande'}
                            </button>
                          </form>
                        )
                      )}
                    </div>
                  </article>
                </Reveal>
                );
              })}
            </div>
          )}
        </section>
      )}
      <SectionsLibres doc={{ sections: SPECTACLES_SECTIONS }}/>
    </>
  );
};

/* ======================= FICHE SPECTACLE ======================= */
const FicheSpectacle = ({ setRoute }) => {
  const { id } = useParams();
  const { SPECTACLES, AGENDA } = useContent();
  const s = SPECTACLES.find(x => x.id === id) || SPECTACLES[0];
  const dates = AGENDA.filter(a => a.spectacle === s.id);
  return (
    <>
      <section className="section" style={{ paddingBottom:40 }}>
        <button className="nav-link" onClick={() => setRoute("spectacles")} style={{ paddingLeft:0, marginBottom:24 }}>← Notre travail</button>
        <div className="col-split" style={{ gap:64, alignItems:"start" }}>
          <div className="noise" style={{ position:"relative", aspectRatio:"4/5", overflow:"hidden" }}>
            {s.image ? <CardPhoto item={s} alt={s.title}/> : <Poster bg={s.color} ink={s.textColor} title={s.title} subtitle={s.tag} num={s.num} variant={2}/>}
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom:20 }}>{s.tag} · {s.duration} · {s.ages}</div>
            <h1 className="display" style={{ fontSize:"clamp(60px, 8vw, 120px)", marginBottom:32 }}>
              {s.title.split(" ").map((w,i) => i === 1 ? <span key={i} className="display-italic">{w} </span> : <span key={i}>{w} </span>)}
            </h1>
            <RichText content={s.desc} style={{ fontSize:20, lineHeight:1.5, marginBottom:32, color:"var(--ink-soft)", textWrap:"pretty" }}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, padding:"24px 0", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)", marginBottom:32 }}>
              <div><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Texte</div><div>{s.auteur}</div></div>
              <div><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Mise en scène</div><div>{s.mes}</div></div>
              <div style={{ gridColumn:"1 / -1" }}><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Avec</div><div>{s.with}</div></div>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button className="btn" onClick={() => setRoute("agenda")}>Voir les dates ({dates.length})</button>
              <button className="btn btn-ghost" onClick={() => setRoute("presse")}>Dossier de presse ↓</button>
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
          {dates.map((d,i) => <AgendaRow key={i} d={d} onClick={() => setRoute("agenda/" + agendaSlug(d))}/>)}
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
  médiation: { label:"Médiation", color:"var(--amber-deep)" },
};

const STATUS_CONFIG = {
  available: { label:"Places disponibles", color:"var(--terra)" },
  few:       { label:"Dernières places",   color:"var(--amber-deep)" },
  sold:      { label:"Complet",            color:"var(--ink-soft)" },
  free:      { label:"Entrée libre",       color:"var(--plum)" },
};

const AgendaCard = ({ d, onClick }) => {
  const { SPECTACLES } = useContent();
  const tc = TYPE_CONFIG[d.type?.[0]] || TYPE_CONFIG.spectacle;
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
        {d.image ? (
          <CardPhoto item={d} alt={d.title} style={{ position:"absolute", inset:0 }}/>
        ) : spectacleData ? (
          <div style={{ position:"absolute", inset:0 }}>
            {spectacleData.image ? <CardPhoto item={spectacleData} alt={spectacleData.title}/> : <Poster bg={spectacleData.color} ink={spectacleData.textColor} title={spectacleData.title} subtitle={spectacleData.tag} num={spectacleData.num} variant={1}/>}
          </div>
        ) : (
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
          {typeLabels(d.type)}
        </div>
      </div>

      {/* Text content — vraiment minimal */}
      <div style={{ padding:"14px 0 8px", borderTop:"1px solid var(--rule)", marginTop:0 }}>
        <h4 className="display" style={{ fontSize:20, lineHeight:1.05, marginBottom:6 }}>{d.title}</h4>
        <div style={{ fontSize:12, color:"var(--ink-soft)", marginBottom:8, letterSpacing:"0.02em" }}>
          {d.day} {d.month} {d.year} · <span>{d.venue}</span>
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

const FR_MONTHS_ORDER = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const FR_MONTHS_FULL = {
  Jan:"Janvier", Fév:"Février", Mar:"Mars", Avr:"Avril", Mai:"Mai", Juin:"Juin",
  Juil:"Juillet", Août:"Août", Sep:"Septembre", Oct:"Octobre", Nov:"Novembre", Déc:"Décembre",
};

/* Fenêtre glissante de 12 mois à partir du mois en cours — plutôt qu'une
   liste de mois figée sur une saison qui finit par se retrouver entièrement
   dans le passé. */
function getRollingSeasonMonths(monthsAhead = 12) {
  const now = new Date();
  const out = [];
  for (let i = 0; i < monthsAhead; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const abbr = FR_MONTHS_ORDER[d.getMonth()];
    out.push({ key: `${abbr} ${d.getFullYear()}`, label: FR_MONTHS_FULL[abbr] });
  }
  return out;
}

const Agenda = ({ setRoute }) => {
  const { AGENDA, AGENDA_SECTIONS, AGENDA_SECTIONS_HAUT } = useContent();
  const seasonMonths = getRollingSeasonMonths();
  const [filter, setFilter] = useState("tout");
  const [month, setMonth] = useState(seasonMonths[0].key);

  const list = useMemo(() => {
    const base = filter === "tout" ? AGENDA : AGENDA.filter(d => d.type?.includes(filter));
    return base.filter(d => d.month + " " + d.year === month);
  }, [AGENDA, filter, month]);

  const countForMonth = (key) => AGENDA.filter(d => d.month + " " + d.year === key).length;

  return (
    <>
    <section className="section" style={{ position:"relative", overflow:"hidden", paddingBottom:0 }}>
      <div ref={useParallax(0.18, 110)} className="motif-bg" style={{ right:-80, top:80, opacity:0.15 }}>
        <Motif size={380} color="var(--plum)" berryColor="var(--terra)" rotate={-20} seed={2.7}/>
      </div>

      <Reveal variant="up" className="section-head">
        <div className="section-num">Saison</div>
        <h2 className="section-title">Agenda.</h2>
      </Reveal>

      <SectionsLibres doc={{ sections: AGENDA_SECTIONS_HAUT }}/>

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
          {seasonMonths.map(m => {
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
                  onClick={() => setRoute("agenda/" + agendaSlug(d))}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
    <SectionsLibres doc={{ sections: AGENDA_SECTIONS }}/>
    </>
  );
};

/* ======================= FICHE AGENDA (détail d'un rendez-vous) ======================= */
const FicheAgenda = ({ setRoute }) => {
  const { slug } = useParams();
  const { AGENDA, SPECTACLES } = useContent();
  const d = AGENDA.find(x => agendaSlug(x) === slug);

  if (!d) {
    return (
      <section className="section">
        <p style={{ fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:22, color:"var(--ink-soft)", marginBottom:24 }}>
          Ce rendez-vous n'existe plus ou a été déplacé.
        </p>
        <button className="btn" onClick={() => setRoute("agenda")}>← Retour à l'agenda</button>
      </section>
    );
  }

  const tc = TYPE_CONFIG[d.type?.[0]] || TYPE_CONFIG.spectacle;
  const sc = STATUS_CONFIG[d.status] || STATUS_CONFIG.available;
  const sp = d.spectacle ? SPECTACLES.find(s => s.id === d.spectacle) : null;
  const isAtelier = d.type?.includes("atelier");

  return (
    <section className="section" style={{ paddingBottom:40 }}>
      <button className="nav-link" onClick={() => setRoute("agenda")} style={{ paddingLeft:0, marginBottom:24 }}>← Agenda</button>

      <div className="col-split" style={{ gap:64, alignItems:"start" }}>
        <div className="noise" style={{ position:"relative", aspectRatio:"4/5", overflow:"hidden" }}>
          {d.image ? (
            <CardPhoto item={d} alt={d.title}/>
          ) : sp ? (
            sp.image ? <CardPhoto item={sp} alt={sp.title}/> : <Poster bg={sp.color} ink={sp.textColor} title={sp.title} subtitle={sp.tag} num={sp.num} variant={2}/>
          ) : (
            <div style={{
              background: d.cardColor || "var(--aubergine)", color: d.cardTextColor || "var(--paper)",
              width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
            }}>
              <Motif size={220} color={d.cardTextColor || "var(--paper)"} berryColor={d.cardTextColor || "var(--paper)"} rotate={12} seed={3}/>
            </div>
          )}
        </div>

        <div>
          <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:20, flexWrap:"wrap" }}>
            <span style={{ background:tc.color, color:"#fff", fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"4px 10px", textTransform:"uppercase" }}>{typeLabels(d.type)}</span>
            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:sc.color }}/>
              <span style={{ fontSize:12, color:sc.color, fontWeight:500 }}>{sc.label}</span>
            </span>
          </div>

          <h1 className="display" style={{ fontSize:"clamp(48px, 6vw, 88px)", lineHeight:1.02, marginBottom:24 }}>
            {d.title}
          </h1>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, padding:"24px 0", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)", marginBottom:32 }}>
            <div><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Date</div><div>{d.day} {d.month} {d.year}</div></div>
            <div><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Horaire</div><div>{d.time}</div></div>
            <div><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Lieu</div><div>{d.venue}</div></div>
            <div><div className="mono" style={{ opacity:0.5, marginBottom:6 }}>Tarif</div><div>{d.price}</div></div>
          </div>

          {d.desc && (
            <RichText content={d.desc} style={{ fontSize:18, lineHeight:1.5, marginBottom:32, color:"var(--ink-soft)", textWrap:"pretty" }}/>
          )}

          {sp && (
            <>
              {!d.desc && <RichText content={sp.desc} style={{ fontSize:18, lineHeight:1.5, marginBottom:32, color:"var(--ink-soft)", textWrap:"pretty" }}/>}
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <button className="btn btn-amber" onClick={() => setRoute("spectacles/" + sp.id)}>Voir le spectacle →</button>
                <button className="btn btn-ghost" onClick={() => setRoute("contact")}>Nous contacter</button>
              </div>
            </>
          )}

          {isAtelier && !sp && (
            <>
              {d.who && <div className="mono" style={{ marginBottom:32, opacity:0.6 }}>Public : {d.who}</div>}
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <button className="btn btn-amber" onClick={() => setRoute("ateliers")}>Voir tous les ateliers →</button>
                <button className="btn btn-ghost" onClick={() => setRoute("contact")}>S'inscrire</button>
              </div>
            </>
          )}

          {!sp && !isAtelier && (
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button className="btn btn-amber" onClick={() => setRoute("contact")}>Nous contacter</button>
              <button className="btn btn-ghost" onClick={() => setRoute("agenda")}>← Retour à l'agenda</button>
            </div>
          )}
        </div>
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
  const { AGENDA, ATELIERS_SECTIONS, ATELIERS_SECTIONS_HAUT } = useContent();
  const ateliersAgenda = useMemo(() => AGENDA.filter(d => d.type?.includes("atelier")), [AGENDA]);
  const [filter, setFilter] = useState(audience);
  const [selected, setSelected] = useState(null);
  const [formStates, setFormStates] = useState({}); // slug -> idle | loading | sent | error

  const handleAtelierSubmit = async (e, atelier) => {
    e.preventDefault();
    e.stopPropagation();
    const key = agendaSlug(atelier);
    setFormStates(s => ({ ...s, [key]: 'loading' }));
    const fd = new FormData(e.target);
    try {
      await postForm('atelier', { atelier: atelier.title, ...Object.fromEntries(fd) });
      setFormStates(s => ({ ...s, [key]: 'sent' }));
    } catch {
      setFormStates(s => ({ ...s, [key]: 'error' }));
    }
  };

  useEffect(() => { setFilter(audience); setSelected(null); }, [audience]);

  const list = filter ? ateliersAgenda.filter(a => a.audience === filter) : ateliersAgenda;

  return (
    <>
      <section className="section" style={{ position:"relative", overflow:"hidden" }}>
        <div ref={useParallax(0.2, 120)} className="motif-bg" style={{ left:-60, top:0, opacity:0.3 }}>
          <Motif size={380} color="var(--amber-deep)" berryColor="var(--terra)" rotate={-30} seed={3}/>
        </div>
        <Reveal variant="up" className="section-head">
          <div className="section-num">Pratiques</div>
          <h2 className="section-title">Ateliers<br/><span className="display-italic">& pratiques.</span></h2>
          <div className="section-meta">Ateliers réguliers à la Filature de l'Isle et en quartier. Activités gratuites ou à tarif accessible. Inscriptions ouvertes.</div>
        </Reveal>

        <SectionsLibres doc={{ sections: ATELIERS_SECTIONS_HAUT }}/>

        {/* Filtre par public */}
        <div style={{ display:"flex", gap:8, marginBottom:40, flexWrap:"wrap" }}>
          {AUDIENCE_FILTERS.map(f => (
            <button key={f.id}
              className={`tweak-pill ${filter === f.id ? "active" : ""}`}
              onClick={() => { setFilter(f.id); setSelected(null); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p style={{ color:"var(--ink-soft)", fontStyle:"italic" }}>Aucun atelier dans cette catégorie pour le moment.</p>
        ) : (
          <div className="grid-3">
            {list.map((a,i) => {
              const key = agendaSlug(a);
              return (
              <Reveal key={key} variant="scale" delay={(i % 3) * 80} style={{ display:"flex" }}>
              <article className={a.image ? "" : "noise"} style={{ flex:1, background: a.image ? "#000" : a.cardColor, color:a.cardTextColor, padding:32, position:"relative", overflow:"hidden", minHeight:340, cursor:"pointer", display:"flex", flexDirection:"column", justifyContent:"space-between" }}
                onClick={() => setSelected(selected === key ? null : key)}
              >
                {a.image ? (
                  <>
                    <CardPhoto item={a} alt={a.title} style={{ position:"absolute", inset:0, opacity:0.5 }}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))" }}/>
                  </>
                ) : (
                  <div style={{ position:"absolute", right:-30, bottom:-40, opacity:0.18 }}>
                    <Motif size={220} color={a.cardTextColor} berryColor={a.cardTextColor} rotate={20} seed={i+1}/>
                  </div>
                )}
                <div style={{ position:"relative", zIndex:2 }}>
                  <h3 className="display" style={{ fontSize:36, lineHeight:1, marginBottom:14 }}>{a.title}</h3>
                  <div style={{ fontSize:14, opacity:0.85, marginBottom:18 }}>{a.who}</div>
                  <RichText content={a.desc} style={{ fontSize:14, lineHeight:1.5, opacity:0.9, textWrap:"pretty" }}/>
                </div>
                <div style={{ position:"relative", zIndex:2, paddingTop:24, marginTop:24, borderTop:`1px solid ${a.cardTextColor}`, opacity:0.95 }}>
                  <div className="mono" style={{ marginBottom:6 }}>{a.time}</div>
                  <div className="mono" style={{ marginBottom:6, opacity:0.7 }}>{a.venue}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:12 }}>
                    <strong style={{ fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:22 }}>{a.price}</strong>
                    <span>{selected === key ? "S'inscrire ↓" : "→"}</span>
                  </div>
                  {selected === key && (
                    formStates[key] === 'sent' ? (
                      <div onClick={e => e.stopPropagation()} style={{ marginTop:16, fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:18, opacity:0.9 }}>
                        Demande envoyée — nous revenons vers vous sous 48h.
                      </div>
                    ) : (
                      <form style={{ marginTop:16, display:"grid", gap:8 }} onClick={e => e.stopPropagation()} onSubmit={e => handleAtelierSubmit(e, a)}>
                        <input type="text" name="bot-field" style={{ display:"none" }} tabIndex="-1" autoComplete="off"/>
                        <input className="input" name="nom" placeholder="Nom" style={{ borderColor:a.cardTextColor, color:a.cardTextColor }} required/>
                        <input className="input" name="email" placeholder="Email" type="email" style={{ borderColor:a.cardTextColor, color:a.cardTextColor }} required/>
                        {formStates[key] === 'error' && (
                          <p style={{ fontSize:11, margin:0, opacity:0.8 }}>Erreur — réessayez ou écrivez à rouletabilletheatre@gmail.com</p>
                        )}
                        <button className="btn btn-amber" type="submit" disabled={formStates[key] === 'loading'} style={{ width:"100%", justifyContent:"center", opacity: formStates[key] === 'loading' ? 0.6 : 1 }}>
                          {formStates[key] === 'loading' ? 'Envoi…' : 'Envoyer la demande'}
                        </button>
                      </form>
                    )
                  )}
                </div>
              </article>
              </Reveal>
              );
            })}
          </div>
        )}
      </section>
      <SectionsLibres doc={{ sections: ATELIERS_SECTIONS }}/>
    </>
  );
};

/* ======================= ÉQUIPE ======================= */
const TEAM_PALETTE = ["#B84A2E","#9B7AA8","#E8B542","#3A1B2E","#8E3620","#C89420","#9B7AA8","#3A1B2E"];

const Equipe = ({ setRoute }) => {
  const { EQUIPE, EQUIPE_SECTIONS, EQUIPE_SECTIONS_HAUT } = useContent();
  const permanents = useMemo(() => EQUIPE.filter(p => p.categorie === "permanente"), [EQUIPE]);
  const associes = useMemo(() => EQUIPE.filter(p => p.categorie === "associee"), [EQUIPE]);
  const conseilAdmin = useMemo(() => EQUIPE.filter(p => p.categorie === "conseil_administration"), [EQUIPE]);

  return (
    <>
      <section className="section" style={{ paddingBottom:40 }}>
        <div className="section-head">
          <div className="section-num">Équipe</div>
          <h2 className="section-title">Un collectif <span className="display-italic">au service</span><br/>de la création.</h2>
          <div className="section-meta">Rouletabille est une association portée par un conseil d'administration, une équipe permanente et un réseau d'artistes associés. Les décisions artistiques et le développement du projet se construisent collectivement, dans une logique de coopération et de responsabilité partagée.</div>
        </div>
      </section>

      <SectionsLibres doc={{ sections: EQUIPE_SECTIONS_HAUT }}/>

      <section className="section" style={{ paddingTop:0 }}>
        <div className="eyebrow" style={{ marginBottom:24 }}>Équipe permanente</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:32 }}>
          {permanents.map((p, i) => (
            <div key={p.name}>
              <div className="noise" style={{ background:"var(--paper-warm)", aspectRatio:"4/5", position:"relative", overflow:"hidden", marginBottom:16 }}>
                {p.image ? <CardPhoto item={p} alt={p.name}/> : <Poster bg={TEAM_PALETTE[i % TEAM_PALETTE.length]} ink="#F4E8D5" title={p.name.split(" ")[0]} subtitle={p.role.split(" • ")[0]} num={String(i+1).padStart(2,"0")} variant={i % 4} motifOpacity={0.5}/>}
              </div>
              <h3 className="display" style={{ fontSize:24, lineHeight:1.1, marginBottom:6 }}>{p.name}</h3>
              <div className="mono" style={{ fontSize:12, color:"var(--terra)", marginBottom:10 }}>{p.role}</div>
              <RichText content={p.bio} style={{ fontSize:14, lineHeight:1.5, color:"var(--ink-soft)" }}/>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background:"var(--paper-warm)" }}>
        <div className="section-head">
          <div className="section-num">Artistes</div>
          <h2 className="section-title">Les artistes <span className="display-italic">associé·es.</span></h2>
          <div className="section-meta">Chaque saison, des artistes rejoignent le projet pour créer, transmettre ou accompagner des résidences. Ils enrichissent notre démarche par leurs univers, leurs disciplines et leurs recherches.</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:32 }}>
          {associes.map((p, i) => (
            <div key={p.name}>
              <div className="noise" style={{ background:"var(--paper)", aspectRatio:"4/5", position:"relative", overflow:"hidden", marginBottom:16 }}>
                {p.image ? <CardPhoto item={p} alt={p.name}/> : <Poster bg={TEAM_PALETTE[(i+3) % TEAM_PALETTE.length]} ink="#F4E8D5" title={p.name.split(" ")[0]} subtitle={p.role.split(" — ")[0].split(",")[0]} num={String(i+1).padStart(2,"0")} variant={i % 4} motifOpacity={0.5}/>}
              </div>
              <h3 className="display" style={{ fontSize:24, lineHeight:1.1, marginBottom:6 }}>{p.name}</h3>
              <div className="mono" style={{ fontSize:12, color:"var(--terra)", marginBottom:10 }}>{p.role}</div>
              <RichText content={p.bio} style={{ fontSize:14, lineHeight:1.5, color:"var(--ink-soft)" }}/>
            </div>
          ))}
        </div>
      </section>

      {conseilAdmin.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div className="section-num">Gouvernance</div>
            <h2 className="section-title">Membres fondateurs <span className="display-italic">& conseil d'administration.</span></h2>
            <div className="section-meta">Celles et ceux qui portent le projet associatif de Rouletabille depuis sa création.</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:32 }}>
            {conseilAdmin.map((p, i) => (
              <div key={p.name}>
                <div className="noise" style={{ background:"var(--paper)", aspectRatio:"4/5", position:"relative", overflow:"hidden", marginBottom:16 }}>
                  {p.image ? <CardPhoto item={p} alt={p.name}/> : <Poster bg={TEAM_PALETTE[(i+5) % TEAM_PALETTE.length]} ink="#F4E8D5" title={p.name.split(" ")[0]} subtitle={p.role.split(" • ")[0]} num={String(i+1).padStart(2,"0")} variant={i % 4} motifOpacity={0.5}/>}
                </div>
                <h3 className="display" style={{ fontSize:24, lineHeight:1.1, marginBottom:6 }}>{p.name}</h3>
                <div className="mono" style={{ fontSize:12, color:"var(--terra)", marginBottom:10 }}>{p.role}</div>
                {p.bio && <RichText content={p.bio} style={{ fontSize:14, lineHeight:1.5, color:"var(--ink-soft)" }}/>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="col-duo" style={{ gap:80, alignItems:"start" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom:20 }}>Compagnons de route</div>
            <p style={{ fontSize:18, lineHeight:1.6, color:"var(--ink-soft)", textWrap:"pretty" }}>
              Depuis plus de trente ans, Rouletabille avance grâce à celles et ceux qui croisent son chemin. Techniciens, costumières, constructeurs, bénévoles, artistes, anciens salariés, services civiques... Ils ont participé à faire de ce lieu ce qu'il est aujourd'hui. Parce qu'une fabrique artistique se construit aussi avec celles et ceux qui restent dans son histoire.
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom:20 }}>Bénévoles</div>
            <p style={{ fontSize:18, lineHeight:1.6, color:"var(--ink-soft)", marginBottom:24, textWrap:"pretty" }}>
              Ils accueillent. Ils construisent. Ils installent. Ils cuisinent. Ils transportent. Ils discutent avec le public. Ils ouvrent les portes. Ils font vivre Rouletabille — sans eux, beaucoup de projets n'existeraient pas.
            </p>
            <button className="btn btn-amber" onClick={() => setRoute("contact")}>Devenir bénévole →</button>
          </div>
        </div>
      </section>
      <SectionsLibres doc={{ sections: EQUIPE_SECTIONS }}/>
    </>
  );
};

/* ======================= PARTENAIRES ======================= */
const TYPE_META = {
  'Soutien institutionnel': {
    accent: 'var(--terra)',
    bg: 'var(--terra)',
    desc: "Financeurs et soutiens officiels. La Rouletabille fabrique artistique et culturelle est labellisée « Lieu de fabrique » par la Région et l'Agence Culturelle de la Dordogne.",
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

const PartnerLogo = ({ partner, bg }) => {
  const initials = partner.name.split(/[\s&–-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  if (partner.image) {
    return (
      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
        <CardPhoto item={partner} alt={partner.name}/>
      </div>
    );
  }
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
  const { PARTENAIRES, PARTENAIRES_SECTIONS, PARTENAIRES_SECTIONS_HAUT } = useContent();
  const motifRef = useParallax(0.16, 100);
  const groups = useMemo(() => {
    const g = {};
    PARTENAIRES.forEach(p => { if (!g[p.type]) g[p.type] = []; g[p.type].push(p); });
    return g;
  }, [PARTENAIRES]);

  return (
    <>
    <section className="section" style={{ position:"relative", overflow:"hidden" }}>
      <div ref={motifRef} className="motif-bg" style={{ right:-50, bottom:-100, opacity:0.3 }}>
        <Motif size={420} color="var(--terra)" berryColor="var(--amber)" rotate={180} seed={3.5}/>
      </div>
      <div className="section-head">
        <div className="section-num">Soutiens</div>
        <h2 className="section-title">Partenaires<br/><span className="display-italic">& soutiens.</span></h2>
        <div className="section-meta">Plus de 30 partenaires contribuent activement à la vie de la compagnie — institutions, artistes, associations de quartier, écoles.</div>
      </div>

      <SectionsLibres doc={{ sections: PARTENAIRES_SECTIONS_HAUT }}/>

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
                    <PartnerLogo partner={p} bg={meta.bg} />
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
    <SectionsLibres doc={{ sections: PARTENAIRES_SECTIONS }}/>
    </>
  );
};

/* ======================= PRESSE ======================= */
const PRESS_KIT = [
  { file: "logo-cie-rouletabille.svg", label: "Logo (SVG)", desc: "Motif physalis, fond transparent" },
  { file: "photo-physalis-1.jpg", label: "Visuel physalis 1 (JPG)", desc: "Macro du motif végétal de la compagnie — haute définition, libre de droits" },
  { file: "photo-physalis-2.jpg", label: "Visuel physalis 2 (JPG)", desc: "Macro du motif végétal de la compagnie — haute définition, libre de droits" },
];

const Presse = () => {
  const { PRESSE } = useContent();
  return (
  <>
  <section className="section">
    <div className="section-head">
      <div className="section-num">Presse</div>
      <h2 className="section-title">Dossier de <span className="display-italic">presse.</span></h2>
      <div className="section-meta">Présentation de la compagnie et visuels libres de droits pour la presse.</div>
    </div>

    <SectionsLibres doc={{ sections: PRESSE.sectionsHaut }}/>

    <div className="col-split" style={{ gap:64, alignItems:"start" }}>
      <div>
        <RichText content={PRESSE.intro} style={{ fontSize:20, lineHeight:1.6, marginBottom:24, color:"var(--ink-soft)", textWrap:"pretty" }}/>
        <p style={{ fontSize:16, lineHeight:1.6, color:"var(--ink-soft)" }}>
          Pour toute demande d'interview, de photo supplémentaire ou d'accréditation, écrivez-nous directement : <a href={`mailto:${PRESSE.contactEmail}?subject=Demande%20presse`} style={{ color:"var(--terra)" }}>{PRESSE.contactEmail}</a>.
        </p>
      </div>
      <div>
        <div className="mono" style={{ marginBottom:14, opacity:0.5 }}>Téléchargements</div>
        {PRESS_KIT.map(item => (
          <a key={item.file} href={`/presse/${item.file}`} download
            style={{
              display:"flex", justifyContent:"space-between", alignItems:"center", gap:16,
              padding:"18px 0", borderTop:"1px solid var(--rule)", textDecoration:"none", color:"inherit",
            }}>
            <div>
              <div style={{ fontSize:17 }}>{item.label}</div>
              <div className="mono" style={{ fontSize:12, opacity:0.5, marginTop:4 }}>{item.desc}</div>
            </div>
            <span style={{ fontSize:20, opacity:0.5, flexShrink:0 }}>↓</span>
          </a>
        ))}
      </div>
    </div>
  </section>
  <SectionsLibres doc={PRESSE}/>
  </>
  );
};

/* ======================= CONTACT ======================= */
const Contact = () => {
  const { CONTACT } = useContent();
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
          <RichText content={CONTACT.meta} className="section-meta"/>
        </div>

        <SectionsLibres doc={{ sections: CONTACT.sectionsHaut }}/>

        <div className="col-duo" style={{ gap:80 }}>
          <div>
            <div style={{ marginBottom:32 }}>
              <div className="mono" style={{ marginBottom:8, opacity:0.5 }}>Adresse</div>
              <div style={{ fontFamily:"var(--ff-display)", fontStyle:"italic", fontSize:28, lineHeight:1.2 }}>
                <span>{CONTACT.addressName}</span><br/>
                <span>{CONTACT.addressLine1}</span><br/>
                <span>{CONTACT.addressLine2}</span>
              </div>
            </div>
            <div style={{ marginBottom:32 }}>
              <div className="mono" style={{ marginBottom:8, opacity:0.5 }}>Contact général</div>
              <div style={{ fontSize:18, color:"var(--terra)" }}>{CONTACT.email}</div>
              <div style={{ fontSize:18, color:"var(--terra)" }}>{CONTACT.website}</div>
              <div className="mono" style={{ marginTop:8 }}>{CONTACT.phone1}</div>
              <div className="mono">{CONTACT.phone2}</div>
            </div>
            <div style={{ marginBottom:32 }}>
              <div className="mono" style={{ marginBottom:8, opacity:0.5 }}>Horaires bureau</div>
              <div style={{ fontSize:16, lineHeight:1.7 }}>{CONTACT.hours}</div>
            </div>
            <div>
              <div className="mono" style={{ marginBottom:8, opacity:0.5 }}>Accès</div>
              <div style={{ fontSize:14, lineHeight:1.7, color:"var(--ink-soft)" }}>
                {CONTACT.access.map((line, i) => (
                  <span key={i}>{line}{i < CONTACT.access.length - 1 && <br/>}</span>
                ))}
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
      <SectionsLibres doc={CONTACT}/>
      <Newsletter/>
    </>
  );
};

/* ======================= NEWSLETTER ======================= */
const Newsletter = () => {
  const { NEWSLETTER } = useContent();
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
          <span>{NEWSLETTER.titleLine1}</span><br/>
          <span className="display-italic">{NEWSLETTER.titleLine2}</span>
        </h2>
        <div>
          <RichText content={NEWSLETTER.description} style={{ fontSize:18, marginBottom:24, maxWidth:480 }}/>
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

/* ======================= MENTIONS LÉGALES ======================= */
const MentionsLegales = () => {
  const { MENTIONS_LEGALES: M } = useContent();
  return (
  <>
  <section className="section">
    <div className="section-head">
      <div className="section-num">Légal</div>
      <h2 className="section-title">Mentions <span className="display-italic">légales.</span></h2>
      <div className="section-meta">Informations légales et politique de confidentialité.</div>
    </div>

    <SectionsLibres doc={{ sections: M.sectionsHaut }}/>

    <div style={{ maxWidth:720, display:"grid", gap:40 }}>
      <div>
        <h3 className="display" style={{ fontSize:26, marginBottom:16 }}>Éditeur du site</h3>
        <p style={{ fontSize:16, lineHeight:1.7, color:"var(--ink-soft)" }}>
          <span>{M.associationName}</span><br/>
          Siège social : <span>{M.siege}</span><br/>
          SIRET : <span>{M.siret}</span><br/>
          Représentante légale : <span>{M.representante}</span><br/>
          Contact : <a href={`mailto:${M.contactEmail}`} style={{ color:"var(--terra)" }}>{M.contactEmail}</a>
        </p>
      </div>

      <div>
        <h3 className="display" style={{ fontSize:26, marginBottom:16 }}>Directeur de la publication</h3>
        <p style={{ fontSize:16, lineHeight:1.7, color:"var(--ink-soft)" }}>
          {M.representante}, en qualité de représentante légale de l'association.
        </p>
      </div>

      <div>
        <h3 className="display" style={{ fontSize:26, marginBottom:16 }}>Hébergement</h3>
        <p style={{ fontSize:16, lineHeight:1.7, color:"var(--ink-soft)" }}>
          <span>{M.hebergeurNom}</span><br/>
          <span>{M.hebergeurAdresse}</span><br/>
          <a href={M.hebergeurUrl} target="_blank" rel="noopener" style={{ color:"var(--terra)" }}>{M.hebergeurUrl.replace(/^https?:\/\//, "")}</a>
        </p>
      </div>

      <div>
        <h3 className="display" style={{ fontSize:26, marginBottom:16 }}>Propriété intellectuelle</h3>
        <RichText content={M.proprieteIntellectuelle} style={{ fontSize:16, lineHeight:1.7, color:"var(--ink-soft)" }}/>
      </div>

      <div>
        <h3 className="display" style={{ fontSize:26, marginBottom:16 }}>Données personnelles</h3>
        <RichText content={M.donneesPersonnelles} style={{ fontSize:16, lineHeight:1.7, color:"var(--ink-soft)" }}/>
      </div>

      <div>
        <h3 className="display" style={{ fontSize:26, marginBottom:16 }}>Cookies et traceurs</h3>
        <RichText content={M.cookies} style={{ fontSize:16, lineHeight:1.7, color:"var(--ink-soft)" }}/>
      </div>
    </div>
  </section>
  <SectionsLibres doc={M}/>
  </>
  );
};

/* ======================= FOOTER ======================= */
const footerLinkStyle = { color:"inherit", textDecoration:"none" };

const Footer = () => {
  const { FOOTER } = useContent();
  return (
  <footer className="footer">
    <div className="col-footer" style={{ marginBottom:48 }}>
      <div>
        <Link to="/" className="nav-logo" style={{ color:"var(--paper)", textDecoration:"none", marginBottom:16 }}>
          <MotifMark size={36} color="var(--paper)"/>
          <span style={{ display:"flex", flexDirection:"column", lineHeight:1 }}>
            <span style={{ fontSize:32 }}>Rouletabille</span>
            <span style={{ fontSize:13, fontFamily:"var(--ff-display)", fontStyle:"italic", opacity:0.65, marginTop:4, lineHeight:1.3 }}>Fabrique artistique<br/>et culturelle</span>
          </span>
        </Link>
        <RichText content={FOOTER.tagline} style={{ opacity:0.7, fontSize:14, lineHeight:1.6, maxWidth:340 }}/>
      </div>
      <div>
        <div className="mono" style={{ marginBottom:14, opacity:0.5 }}>Découvrir</div>
        <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:14 }}>
          <li><Link to="/spectacles" style={footerLinkStyle}>Notre travail</Link></li>
          <li><Link to="/agenda" style={footerLinkStyle}>Agenda</Link></li>
          <li><Link to="/equipe" style={footerLinkStyle}>Équipe</Link></li>
          <li><Link to="/partenaires" style={footerLinkStyle}>Partenaires</Link></li>
        </ul>
      </div>
      <div>
        <div className="mono" style={{ marginBottom:14, opacity:0.5 }}>Pratique</div>
        <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:14 }}>
          <li><Link to="/contact" style={footerLinkStyle}>Contact</Link></li>
          <li><Link to="/contact" style={footerLinkStyle}>Venir à l'atelier</Link></li>
          <li><Link to="/presse" style={footerLinkStyle}>Dossiers de presse</Link></li>
          <li><Link to="/mentions-legales" style={footerLinkStyle}>Mentions légales</Link></li>
        </ul>
      </div>
      <div>
        <div className="mono" style={{ marginBottom:14, opacity:0.5 }}>Suivre</div>
        <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8, fontSize:14 }}>
          <li><a href="https://www.instagram.com/rouletabilletheatre" target="_blank" rel="noopener" style={footerLinkStyle}>Instagram</a></li>
          <li>Facebook</li>
          <li>LinkedIn</li>
          <li>HelloAsso</li>
          <li><Link to="/contact" style={footerLinkStyle}>Newsletter</Link></li>
        </ul>
      </div>
    </div>
    <div style={{ borderTop:"1px solid color-mix(in oklab, var(--paper) 20%, transparent)", paddingTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, fontSize:12, opacity:0.6 }}>
      <span>{FOOTER.copyright}</span>
      <span>{FOOTER.seasonLabel}</span>
    </div>
  </footer>
  );
};

export { Nav, Home, Spectacles, FicheSpectacle, Agenda, FicheAgenda, Ateliers, Equipe, Partenaires, Presse, MentionsLegales, Contact, Footer };
