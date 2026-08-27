import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { initFX } from './fx.jsx';
import { ContentProvider } from './content-context.jsx';
import { Nav, Home, Spectacles, FicheSpectacle, Agenda, FicheAgenda, Ateliers, Equipe, Partenaires, Presse, MentionsLegales, Contact, Footer } from './screens.jsx';
import { Archives, FicheArchive } from './archives.jsx';
import { CreationsCompagnie } from './creationsCompagnie.jsx';
import { ProjetsTerritoire } from './projetsTerritoire.jsx';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "default",
  "density": "default",
  "anim": "normal",
  "dark": false
}/*EDITMODE-END*/;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenLabel = location.pathname === "/" ? "home" : location.pathname.slice(1);
  const setRoute = (r) => { navigate(r === "home" ? "/" : "/" + r); window.scrollTo({ top:0, behavior:"smooth" }); };

  const [atelierAudience, setAtelierAudience] = useState("");

  useEffect(() => { initFX(); }, []);
  // Les <Link> (notamment ceux du Footer) ne passent pas par setRoute() et
  // ne déclenchaient donc aucun scroll : sans ce reset, on atterrit sur une
  // nouvelle page avec le défilement hérité de la précédente.
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({type: "__edit_mode_available"}, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const updateTweak = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({type: "__edit_mode_set_keys", edits: { [k]: v }}, "*");
  };

  useEffect(() => {
    const root = document.body;
    root.className = "app-root";
    if (tweaks.palette === "sobre") root.classList.add("palette-sobre");
    if (tweaks.palette === "nocturne" || tweaks.dark) root.classList.add("palette-nocturne");
    if (tweaks.density === "compact") root.classList.add("density-compact");
    if (tweaks.density === "airy") root.classList.add("density-airy");
    if (tweaks.anim === "off") root.classList.add("anim-off");
    if (tweaks.anim === "low") root.classList.add("anim-low");
  }, [tweaks]);

  return (
    <div className="app" data-screen-label={screenLabel}>
      <Nav route={screenLabel}/>
      <Routes>
        <Route path="/" element={<Home setRoute={setRoute}/>}/>
        <Route path="/notre-travail" element={<Spectacles setRoute={setRoute}/>}/>
        <Route path="/notre-travail/:id" element={<FicheSpectacle setRoute={setRoute}/>}/>
        <Route path="/agenda" element={<Agenda setRoute={setRoute}/>}/>
        <Route path="/agenda/:slug" element={<FicheAgenda setRoute={setRoute}/>}/>
        <Route path="/ateliers" element={<Ateliers audience={atelierAudience}/>}/>
        <Route path="/equipe" element={<Equipe setRoute={setRoute}/>}/>
        <Route path="/partenaires" element={<Partenaires/>}/>
        <Route path="/presse" element={<Presse/>}/>
        <Route path="/archives" element={<Archives/>}/>
        <Route path="/archives/creations-de-la-compagnie" element={<CreationsCompagnie/>}/>
        <Route path="/archives/projets-de-territoire" element={<ProjetsTerritoire/>}/>
        <Route path="/archives/:slug" element={<FicheArchive/>}/>
        <Route path="/mentions-legales" element={<MentionsLegales/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="*" element={<Home setRoute={setRoute}/>}/>
      </Routes>
      <Footer/>
      {tweaksOpen && (
        <div className="tweaks-panel">
          <h4>Tweaks</h4>
          <div className="tweaks-row">
            <label>Palette</label>
            <div className="tweaks-pills">
              {["default","sobre","nocturne"].map(p => (
                <button key={p} className={`tweak-pill ${tweaks.palette === p ? "active" : ""}`} onClick={() => updateTweak("palette", p)}>{p === "default" ? "terracotta" : p}</button>
              ))}
            </div>
          </div>
          <div className="tweaks-row">
            <label>Densité</label>
            <div className="tweaks-pills">
              {["compact","default","airy"].map(p => (
                <button key={p} className={`tweak-pill ${tweaks.density === p ? "active" : ""}`} onClick={() => updateTweak("density", p)}>{p === "default" ? "normal" : p}</button>
              ))}
            </div>
          </div>
          <div className="tweaks-row">
            <label>Animations botaniques</label>
            <div className="tweaks-pills">
              {["off","low","normal"].map(p => (
                <button key={p} className={`tweak-pill ${tweaks.anim === p ? "active" : ""}`} onClick={() => updateTweak("anim", p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="tweaks-row">
            <label>Mode</label>
            <div className="tweaks-pills">
              <button className={`tweak-pill ${!tweaks.dark ? "active" : ""}`} onClick={() => updateTweak("dark", false)}>clair</button>
              <button className={`tweak-pill ${tweaks.dark ? "active" : ""}`} onClick={() => updateTweak("dark", true)}>sombre</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ContentProvider>
      <App/>
    </ContentProvider>
  </BrowserRouter>
);
