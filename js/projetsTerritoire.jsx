import { Link } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { urlFor } from './sanity-client.js';
import { Reveal, useParallax } from './fx.jsx';
import { Motif } from './motif.jsx';
import { useContent } from './content-context.jsx';
import { portableTextComponents, MONTHS_FR } from './archives.jsx';

const ArticleBlock = ({ article, index }) => {
  const d = new Date(article.publishedAt);
  const dateLabel = `${d.getDate()} ${MONTHS_FR[d.getMonth() + 1]} ${d.getFullYear()}`;
  const imgSrc = article.mainImage ? urlFor(article.mainImage).width(900).fit('max').auto('format').url() : null;

  // Le "Reveal" (fade scroll-based) ne doit envelopper que le petit
  // en-tête : un article avec des dizaines de photos peut faire des
  // dizaines de milliers de px de haut, et l'IntersectionObserver derrière
  // Reveal ne déclenche que si 15% de la hauteur de l'élément enveloppé
  // devient visible — un seuil qu'un élément aussi grand ne peut
  // structurellement jamais atteindre (il resterait invisible à vie).
  return (
    <article>
      <Reveal variant="up" delay={(index % 3) * 70} style={{ marginTop: index === 0 ? 0 : 48 }}>
        <div className="tag" style={{ color: 'var(--terra)', marginBottom: 8 }}>{dateLabel}</div>
        <h3 className="display" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 16, textWrap: 'balance' }}>
          {article.title}
        </h3>
        {imgSrc && (
          <div style={{ marginBottom: 20, maxWidth: 640 }}>
            <img
              src={imgSrc}
              alt=""
              loading="lazy"
              width={article.mainImage?.dims?.width}
              height={article.mainImage?.dims?.height}
              style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: article.mainImage?.dims?.aspectRatio || undefined }}
            />
          </div>
        )}
      </Reveal>
      <div className="article-content" style={{ maxWidth: 680, fontSize: 15, lineHeight: 1.7 }}>
        <PortableText value={article.body} components={portableTextComponents} />
      </div>
    </article>
  );
};

const ProjectSection = ({ project, index }) => (
  <section className="section" style={{ paddingTop: index === 0 ? 32 : 0, borderTop: index === 0 ? 'none' : '1px solid var(--rule-strong)' }}>
    <Reveal variant="up">
      <h2 className="display" style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.1, marginBottom: 12, textWrap: 'balance' }}>
        {project.title}
      </h2>
      {project.description && (
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 640, marginBottom: 32 }}>
          {project.description}
        </p>
      )}
    </Reveal>
    <div>
      {(project.articles || []).map((article, i) => (
        <ArticleBlock key={article.slug} article={article} index={i} />
      ))}
    </div>
  </section>
);

const ProjetsTerritoire = () => {
  const { PROJETS_TERRITOIRE_PAGE } = useContent();
  const motifRef = useParallax(0.18, 110);
  const projects = PROJETS_TERRITOIRE_PAGE?.projects || [];

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
    </>
  );
};

export { ProjetsTerritoire };
