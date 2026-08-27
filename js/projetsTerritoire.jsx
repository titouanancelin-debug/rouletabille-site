import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { urlFor } from './sanity-client.js';
import { Reveal, useParallax } from './fx.jsx';
import { Motif } from './motif.jsx';
import { useContent } from './content-context.jsx';
import { MONTHS_FR, ArchiveCard, agendaToArchiveItem } from './archives.jsx';
import { splitArchivedAgenda } from './agenda-archive.js';
import { RichText } from './rich-content.jsx';

// Un article d'archive repris ici peut contenir des dizaines de photos
// (reportage photo Overblog) — les afficher toutes pleine largeur rendait la
// page ingérable (des dizaines de milliers de px de haut). On montre à la
// place un extrait du texte + une galerie compacte, avec un lien vers la
// fiche archive complète (même route que /archives) pour qui veut tout lire.
const GALLERY_CAP = 8;

const excerptFromBody = (body, maxLen = 200) => {
  const text = (body || [])
    .filter((b) => b._type === 'block')
    .map((b) => (b.children || []).map((c) => c.text || '').join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  return text.length <= maxLen ? text : text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
};

const ArticleBlock = ({ article, index }) => {
  const d = new Date(article.publishedAt);
  const dateLabel = `${d.getDate()} ${MONTHS_FR[d.getMonth() + 1]} ${d.getFullYear()}`;
  const excerpt = excerptFromBody(article.body);
  const bodyImages = (article.body || []).filter((b) => b._type === 'image');
  const coverImage = article.mainImage || bodyImages[0];
  const galleryImages = (article.mainImage ? bodyImages : bodyImages.slice(1)).slice(0, GALLERY_CAP);
  const remaining = (article.mainImage ? bodyImages.length : bodyImages.length - 1) - galleryImages.length;
  const coverSrc = coverImage ? urlFor(coverImage).width(900).fit('max').auto('format').url() : null;

  return (
    <Reveal as="article" variant="up" delay={(index % 3) * 70} style={{ marginTop: index === 0 ? 0 : 48 }}>
      <div className="tag" style={{ color: 'var(--terra)', marginBottom: 8 }}>{dateLabel}</div>
      <h3 className="display" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 16, textWrap: 'balance' }}>
        {article.title}
      </h3>
      {coverSrc && (
        <div style={{ marginBottom: 16, maxWidth: 640 }}>
          <img src={coverSrc} alt="" loading="lazy" style={{ width: '100%', height: 'auto', display: 'block' }}/>
        </div>
      )}
      {excerpt && (
        <p style={{ maxWidth: 640, fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)', marginBottom: 16 }}>
          {excerpt}
        </p>
      )}
      {galleryImages.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6, maxWidth: 640, marginBottom: 20 }}>
          {galleryImages.map((img, i) => {
            const isLast = i === galleryImages.length - 1 && remaining > 0;
            const src = urlFor(img).width(200).height(200).fit('crop').auto('format').url();
            return (
              <div key={img._key || i} style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                {isLast && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-mono)', fontSize: 13 }}>
                    +{remaining}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Link to={`/archives/${article.slug}`} className="nav-link" style={{ padding: 0, fontSize: 13 }}>
        Lire l'article complet →
      </Link>
    </Reveal>
  );
};

const ProjectSection = ({ project, index }) => (
  <section className="section" style={{ paddingTop: index === 0 ? 32 : 0, borderTop: index === 0 ? 'none' : '1px solid var(--rule-strong)' }}>
    <Reveal variant="up">
      <h2 className="display" style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.1, marginBottom: 12, textWrap: 'balance' }}>
        {project.title}
      </h2>
      {project.description && (
        <RichText content={project.description} style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 640, marginBottom: 32 }}/>
      )}
    </Reveal>
    <div>
      {[...(project.articles || [])]
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .map((article, i) => (
          <ArticleBlock key={article.slug} article={article} index={i} />
        ))}
    </div>
  </section>
);

const ProjetsTerritoire = () => {
  const { PROJETS_TERRITOIRE_PAGE, AGENDA } = useContent();
  const motifRef = useParallax(0.18, 110);
  // Les projets eux-mêmes sont classés par la date de leur article le plus
  // récent (et pas seulement les articles à l'intérieur de chaque projet) :
  // le projet le plus récemment alimenté apparaît en premier.
  const mostRecentDate = (project) =>
    Math.max(0, ...(project.articles || []).map((a) => new Date(a.publishedAt).getTime() || 0));
  const projects = useMemo(
    () => [...(PROJETS_TERRITOIRE_PAGE?.projects || [])].sort((a, b) => mostRecentDate(b) - mostRecentDate(a)),
    [PROJETS_TERRITOIRE_PAGE]
  );
  // Rendez-vous d'agenda de type "projet de territoire" archivés
  // automatiquement après 1 an (js/agenda-archive.js) : viennent s'ajouter
  // aux projets curés manuellement ci-dessus, sans les remplacer.
  const archivedTerritoire = useMemo(
    () => splitArchivedAgenda(AGENDA || []).archivedTerritoire
      .map(agendaToArchiveItem)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
    [AGENDA]
  );

  return (
    <>
      <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
        <div ref={motifRef} className="motif-bg" style={{ right: -80, top: 0, opacity: 0.15 }}>
          <Motif size={420} color="var(--plum)" berryColor="var(--terra)" rotate={-25} seed={11} />
        </div>
        <Link to="/archives" className="nav-link" style={{ paddingLeft: 0, marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          ← Archives
        </Link>
        <Reveal variant="up" className="section-head">
          <div className="section-num">{PROJETS_TERRITOIRE_PAGE?.headerEyebrow || 'Ancrage local'}</div>
          <h2 className="section-title">
            {PROJETS_TERRITOIRE_PAGE?.headerTitleMain || 'Projets de'}<br />
            <span className="display-italic">{PROJETS_TERRITOIRE_PAGE?.headerTitleItalic || 'territoire.'}</span>
          </h2>
          {PROJETS_TERRITOIRE_PAGE?.headerMeta && (
            <div className="section-meta">{PROJETS_TERRITOIRE_PAGE.headerMeta}</div>
          )}
        </Reveal>
      </section>

      {projects.length === 0 ? (
        <section className="section" style={{ paddingTop: 32 }}>
          <p style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)', opacity: 0.5 }}>
            Aucun projet à afficher pour le moment.
          </p>
        </section>
      ) : (
        projects.map((project, i) => (
          <ProjectSection key={project._key || i} project={project} index={i} />
        ))
      )}

      {archivedTerritoire.length > 0 && (
        <section className="section" style={{ borderTop: projects.length > 0 ? '1px solid var(--rule-strong)' : 'none' }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>Autres projets archivés</div>
          <div className="grid-3">
            {archivedTerritoire.map((art) => <ArchiveCard key={art.slug} art={art} />)}
          </div>
        </section>
      )}
    </>
  );
};

export { ProjetsTerritoire };
