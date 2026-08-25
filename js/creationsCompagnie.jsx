import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Reveal, useParallax } from './fx.jsx';
import { Motif } from './motif.jsx';
import { useContent } from './content-context.jsx';
import { splitArchivedAgenda } from './agenda-archive.js';
import { ArchiveCard, agendaToArchiveItem } from './archives.jsx';
import { RichText } from './rich-content.jsx';

// Extrait un id vidéo YouTube depuis n'importe quelle forme d'URL usuelle
// (watch?v=, youtu.be/, déjà en /embed/) pour construire l'iframe d'intégration.
function youtubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([\w-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

const CreationRow = ({ creation, index }) => {
  const embedUrl = youtubeEmbedUrl(creation.videoUrl);

  return (
    <Reveal variant="up" delay={(index % 4) * 60}>
      <article style={{
        display: 'grid',
        gridTemplateColumns: embedUrl ? '120px 1fr' : '120px 1fr',
        gap: 24,
        padding: '28px 0',
        borderTop: '1px solid var(--rule)',
        alignItems: 'start',
      }}>
        <div className="mono" style={{ fontSize: 14, color: 'var(--terra)', paddingTop: 4 }}>
          {creation.year || '—'}
        </div>
        <div>
          <h3 className="display" style={{ fontSize: 24, lineHeight: 1.15, marginBottom: 10, textWrap: 'balance' }}>
            {creation.title}
          </h3>
          {creation.description && (
            <RichText content={creation.description} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 720, marginBottom: embedUrl ? 20 : 0 }}/>
          )}
          {embedUrl && (
            <div style={{ maxWidth: 560, aspectRatio: '16/9', marginTop: 4 }}>
              <iframe
                src={embedUrl}
                title={creation.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            </div>
          )}
        </div>
      </article>
    </Reveal>
  );
};

const CreationsCompagnie = () => {
  const { CREATIONS_COMPAGNIE_PAGE, AGENDA } = useContent();
  const motifRef = useParallax(0.18, 110);
  const creations = CREATIONS_COMPAGNIE_PAGE?.creations || [];
  // Rendez-vous d'agenda de type "spectacle" archivés automatiquement après
  // 1 an (voir js/agenda-archive.js) : viennent s'ajouter aux créations
  // curées manuellement ci-dessus, sans les remplacer.
  const archivedSpectacles = useMemo(
    () => splitArchivedAgenda(AGENDA || []).archivedSpectacles.map(agendaToArchiveItem),
    [AGENDA]
  );

  return (
    <>
      <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
        <div ref={motifRef} className="motif-bg" style={{ right: -80, top: 0, opacity: 0.15 }}>
          <Motif size={420} color="var(--plum)" berryColor="var(--terra)" rotate={-25} seed={9} />
        </div>
        <Link to="/archives" className="nav-link" style={{ paddingLeft: 0, marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          ← Archives
        </Link>
        <Reveal variant="up" className="section-head">
          <div className="section-num">{CREATIONS_COMPAGNIE_PAGE?.headerEyebrow || 'Depuis 1993'}</div>
          <h2 className="section-title">
            {CREATIONS_COMPAGNIE_PAGE?.headerTitleMain || 'Spectacles de la'}<br />
            <span className="display-italic">{CREATIONS_COMPAGNIE_PAGE?.headerTitleItalic || 'compagnie.'}</span>
          </h2>
          {CREATIONS_COMPAGNIE_PAGE?.headerMeta && (
            <div className="section-meta">{CREATIONS_COMPAGNIE_PAGE.headerMeta}</div>
          )}
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 32 }}>
        {creations.length === 0 ? (
          <p style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)', opacity: 0.5 }}>
            Aucune création à afficher pour le moment.
          </p>
        ) : (
          <div>
            {creations.map((c, i) => (
              <CreationRow key={c._key || i} creation={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {archivedSpectacles.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>Autres spectacles archivés</div>
          <div className="grid-3">
            {archivedSpectacles.map((art) => <ArchiveCard key={art.slug} art={art} />)}
          </div>
        </section>
      )}
    </>
  );
};

export { CreationsCompagnie };
