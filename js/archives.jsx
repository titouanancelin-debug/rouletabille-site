import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { sanityClient, urlFor } from './sanity-client.js';
import { Reveal, useParallax } from './fx.jsx';
import { Motif } from './motif.jsx';
import { useContent } from './content-context.jsx';

export const MONTHS_FR = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const LIST_QUERY = `*[_type == "archiveArticle"] | order(publishedAt desc) {
  title, "slug": slug.current, publishedAt, author, mainImage
}`;

const DETAIL_QUERY = `*[_type == "archiveArticle" && slug.current == $slug][0] {
  title, publishedAt, author, mainImage, body
}`;

function useArchiveList() {
  const [articles, setArticles] = useState(null);
  useEffect(() => {
    let cancelled = false;
    sanityClient.fetch(LIST_QUERY).then((data) => {
      if (!cancelled) setArticles(data);
    });
    return () => { cancelled = true; };
  }, []);
  return articles;
}

function groupByYearMonth(articles) {
  const map = {};
  (articles || []).forEach((art) => {
    const d = new Date(art.publishedAt);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (!map[y]) map[y] = {};
    if (!map[y][m]) map[y][m] = [];
    map[y][m].push(art);
  });
  return map;
}

export const portableTextComponents = {
  types: {
    image: ({ value }) => (
      <img
        src={urlFor(value).width(1200).fit('max').auto('format').url()}
        alt=""
        loading="lazy"
        style={{ width: '100%', height: 'auto', display: 'block', margin: '32px 0' }}
      />
    ),
  },
};

/* ── Carte d'un article ── */
const ArchiveCard = ({ art }) => {
  const d = new Date(art.publishedAt);
  const dateLabel = `${d.getDate()} ${MONTHS_FR[d.getMonth() + 1]} ${d.getFullYear()}`;
  const imgSrc = art.mainImage ? urlFor(art.mainImage).width(600).height(450).fit('crop').auto('format').url() : null;

  return (
    <Link to={`/archives/${art.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="card card-fx" style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}>
        <div className="card-img" style={{ aspectRatio: '4/3' }}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={art.title}
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.18 }}>
              <Motif size={160} color="var(--terra)" berryColor="var(--amber)" rotate={15} seed={2.5} />
            </div>
          )}
        </div>
        <div style={{ padding: '16px 4px 8px', borderTop: '1px solid var(--rule)', marginTop: 12 }}>
          <div className="tag" style={{ color: 'var(--terra)', marginBottom: 6 }}>{dateLabel}</div>
          <h3 className="display" style={{ fontSize: 20, lineHeight: 1.1, textWrap: 'balance' }}>
            {art.title}<span className="card-arrow">→</span>
          </h3>
        </div>
      </article>
    </Link>
  );
};

/* ── Écran Archives (liste) ── */
const Archives = () => {
  const { ARCHIVES_PAGE } = useContent();
  const articles = useArchiveList();
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [search, setSearch] = useState('');
  const motifRef = useParallax(0.18, 110);

  const archiveData = useMemo(() => groupByYearMonth(articles), [articles]);
  const years = useMemo(() => Object.keys(archiveData).map(Number).sort((a, b) => b - a), [archiveData]);
  const activeYear = year ?? years[0];

  useEffect(() => {
    if (year === null && years.length > 0) setYear(years[0]);
  }, [years, year]);

  if (!articles) {
    return (
      <section className="section">
        <p style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)', opacity: 0.6 }}>
          Chargement des archives…
        </p>
      </section>
    );
  }

  const monthsInYear = Object.keys(archiveData[activeYear] || {}).map(Number).sort((a, b) => b - a);
  const articlesToShow = month !== null
    ? (archiveData[activeYear]?.[month] ?? [])
    : monthsInYear.flatMap((m) => archiveData[activeYear][m]);
  const totalYear = monthsInYear.reduce((acc, m) => acc + archiveData[activeYear][m].length, 0);

  const q = search.trim().toLowerCase();
  const filtered = q ? articlesToShow.filter((a) => a.title.toLowerCase().includes(q)) : articlesToShow;

  return (
    <>
      <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
        <div ref={motifRef} className="motif-bg" style={{ right: -80, top: 0, opacity: 0.15 }}>
          <Motif size={420} color="var(--plum)" berryColor="var(--terra)" rotate={-25} seed={7} />
        </div>
        <Reveal variant="up" className="section-head">
          <div className="section-num">{ARCHIVES_PAGE?.headerEyebrow}</div>
          <h2 className="section-title">
            {ARCHIVES_PAGE?.headerTitleMain}<br /><span className="display-italic">{ARCHIVES_PAGE?.headerTitleItalic}</span>
          </h2>
          <div className="section-meta">
            {articles.length} publications · {years[years.length - 1]} — {years[0]} · {ARCHIVES_PAGE?.headerMeta}
          </div>
        </Reveal>
      </section>

      <div style={{
        position: 'sticky', top: 56, zIndex: 20,
        background: 'color-mix(in oklab, var(--paper) 96%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--rule-strong)',
        margin: '0 calc(-1 * var(--pad-x))',
        padding: '0 var(--pad-x)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {years.map((y) => {
              const count = Object.values(archiveData[y]).reduce((a, b) => a + b.length, 0);
              const active = activeYear === y;
              return (
                <button
                  key={y}
                  onClick={() => { setYear(y); setMonth(null); setSearch(''); }}
                  style={{
                    flexShrink: 0, padding: '16px 20px 14px', background: 'none', border: 'none',
                    borderBottom: active ? '2px solid var(--terra)' : '2px solid transparent',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'color 0.2s, border-color 0.2s', color: active ? 'var(--terra)' : 'var(--ink-soft)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--ff-body)', fontSize: 13, fontWeight: active ? 600 : 400 }}>{y}</span>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, opacity: 0.55 }}>{count}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexShrink: 0, gap: 24 }}>
            <Link
              to="/archives/creations-de-la-compagnie"
              className="nav-link"
              style={{ fontSize: 13, whiteSpace: 'nowrap', padding: 0 }}
            >
              Spectacles de la compagnie
            </Link>
            <Link
              to="/archives/projets-de-territoire"
              className="nav-link"
              style={{ fontSize: 13, whiteSpace: 'nowrap', padding: 0 }}
            >
              Projets de territoire
            </Link>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 32, position: 'relative' }}>
        <div aria-hidden="true" style={{
          position: 'absolute', right: 'var(--pad-x)', top: 0,
          fontFamily: 'var(--ff-display)', fontSize: 'clamp(90px, 16vw, 180px)',
          fontWeight: 400, lineHeight: 1, color: 'var(--terra)', opacity: 0.05,
          userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.04em', zIndex: 0,
        }}>
          {activeYear}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <span className="mono" style={{ color: 'var(--terra)', fontSize: 11, marginRight: 8 }}>
            {totalYear} article{totalYear > 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <button
            className={`tweak-pill ${month === null ? 'active' : ''}`}
            onClick={() => { setMonth(null); setSearch(''); }}
            style={month === null ? { background: 'var(--terra)', color: '#fff', borderColor: 'var(--terra)' } : {}}
          >
            Tous
          </button>
          {monthsInYear.map((m) => (
            <button
              key={m}
              className={`tweak-pill ${month === m ? 'active' : ''}`}
              onClick={() => { setMonth(m); setSearch(''); }}
              style={month === m ? { background: 'var(--terra)', color: '#fff', borderColor: 'var(--terra)' } : {}}
            >
              {MONTHS_FR[m]}
              <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.65 }}>{archiveData[activeYear][m].length}</span>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 28, position: 'relative', maxWidth: 480, zIndex: 1 }}>
          <input
            className="input"
            type="search"
            placeholder="Rechercher dans les archives…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40, width: '100%' }}
          />
          <span aria-hidden="true" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4, pointerEvents: 'none' }}>⌕</span>
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)', opacity: 0.5 }}>
            {q ? `Aucun résultat pour « ${search} »` : 'Aucun article ce mois-ci.'}
          </p>
        ) : (
          <>
            {q && (
              <p className="mono" style={{ fontSize: 11, color: 'var(--terra)', marginBottom: 24 }}>
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour « {search} »
              </p>
            )}
            <div className="grid-3">
              {filtered.map((art, i) => (
                <Reveal key={art.slug} variant="up" delay={(i % 3) * 70}>
                  <ArchiveCard art={art} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
};

/* ── Article reader ── */
const FicheArchive = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(undefined);
  const allArticles = useArchiveList();

  useEffect(() => {
    setArticle(undefined);
    sanityClient.fetch(DETAIL_QUERY, { slug }).then(setArticle);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (article === undefined) {
    return (
      <section className="section">
        <p style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)', opacity: 0.6 }}>
          Chargement…
        </p>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="section">
        <p style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)' }}>
          Cet article n'existe plus ou a été déplacé.
        </p>
        <Link className="btn" to="/archives" style={{ marginTop: 24, display: 'inline-block' }}>← Retour aux archives</Link>
      </section>
    );
  }

  const d = new Date(article.publishedAt);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const monthLabel = MONTHS_FR[month];
  const imgSrc = article.mainImage ? urlFor(article.mainImage).width(600).height(450).fit('crop').auto('format').url() : null;

  const siblings = (allArticles || [])
    .filter((a) => {
      const ad = new Date(a.publishedAt);
      return ad.getFullYear() === year && ad.getMonth() + 1 === month && a.slug !== slug;
    })
    .slice(0, 6);

  return (
    <>
      <section className="section" style={{ paddingBottom: 0, position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{
          position: 'absolute', right: 'var(--pad-x)', top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--ff-display)', fontSize: 'clamp(120px, 18vw, 220px)',
          fontWeight: 400, lineHeight: 1, color: 'var(--terra)', opacity: 0.06,
          userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.04em',
        }}>
          {year}
        </div>
        <div style={{ position: 'absolute', right: -60, bottom: -40, opacity: 0.12, pointerEvents: 'none' }}>
          <Motif size={360} color="var(--plum)" berryColor="var(--terra)" rotate={-20} seed={6} />
        </div>

        <Link to="/archives" className="nav-link" style={{ paddingLeft: 0, marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          ← Archives
        </Link>

        <div style={{ marginBottom: 24 }}>
          <div className="eyebrow">{day} {monthLabel} {year}</div>
        </div>

        <h1 className="display" style={{ fontSize: 'clamp(36px, 5.5vw, 80px)', lineHeight: 1.0, textWrap: 'balance', maxWidth: 820, marginBottom: 36, position: 'relative', zIndex: 1 }}>
          {article.title.split(' ').map((w, i) => (
            i === 1
              ? <span key={i} className="display-italic" style={{ color: 'var(--terra)' }}>{w} </span>
              : <span key={i}>{w} </span>
          ))}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 3, background: 'var(--terra)', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          <div style={{ width: 8, height: 8, background: 'var(--amber)', transform: 'rotate(45deg)', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        </div>
      </section>

      <div style={{ padding: '48px var(--pad-x) var(--pad-y)', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '64px', alignItems: 'start' }} className="article-reader-body">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <div style={{ width: 48, height: 3, background: 'var(--terra)', flexShrink: 0 }} />
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            <div style={{ width: 8, height: 8, background: 'var(--amber)', transform: 'rotate(45deg)', flexShrink: 0 }} />
          </div>

          <div className="article-content article-content-rich">
            <PortableText value={article.body} components={portableTextComponents} />
          </div>

          <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--rule)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 2, background: 'var(--terra)' }} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--terra)', letterSpacing: '0.15em' }}>FIN DE L'ARTICLE</span>
            </div>
            <Link to="/archives" className="btn" style={{ marginTop: 24, display: 'inline-block' }}>← Retour aux archives</Link>
          </div>
        </div>

        <aside style={{ position: 'sticky', top: 88 }}>
          {imgSrc && (
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', marginBottom: 2 }}>
              <img src={imgSrc} alt="" aria-hidden="true" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ padding: '20px 0', borderTop: '2px solid var(--terra)', borderBottom: '1px solid var(--rule)', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span className="display" style={{ fontSize: 48, lineHeight: 1, color: 'var(--terra)' }}>{day}</span>
              <span className="display-italic" style={{ fontSize: 22, color: 'var(--ink)' }}>{monthLabel} {year}</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', opacity: 0.7 }}>
              {article.author || 'Compagnie Rouletabille Théâtre'}
            </div>
          </div>

          {siblings.length > 0 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Aussi en {monthLabel} {year}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {siblings.map((s, i) => {
                  const sd = new Date(s.publishedAt);
                  return (
                    <Link
                      key={s.slug}
                      to={`/archives/${s.slug}`}
                      style={{
                        textDecoration: 'none', color: 'inherit', padding: '12px 0',
                        borderTop: i === 0 ? '1px solid var(--rule-strong)' : '1px solid var(--rule)',
                        display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'color 0.15s',
                      }}
                    >
                      <span className="mono" style={{ fontSize: 11, opacity: 0.45, flexShrink: 0, paddingTop: 3 }}>
                        {String(sd.getDate()).padStart(2, '0')}
                      </span>
                      <span style={{ fontFamily: 'var(--ff-body)', fontSize: 13, lineHeight: 1.4, textWrap: 'balance' }}>
                        {s.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export { Archives, FicheArchive };
