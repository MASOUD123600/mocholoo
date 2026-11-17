import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Calendar, Clock, Instagram, MapPin, Navigation, Phone, User } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Empty, Reveal, Seo, Spinner } from "../components/ui";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { BRAND, BRANCHES, CATEGORIES, SITE_URL, categoryBySlug, categoryUrl } from "../config";
import SEO from "../data/seo.json";
import INDEX from "../data/contentIndex.json";
import LANDING from "../data/landing.json";
import { PET_SLUGS, brandOf, brandPath, brandProducts, itemListLd, petCatPath, petCatProducts, priceRange } from "../lib/landing";
import { CLUSTERS, TOPICS, blocks, inline } from "../lib/richText";
import { articleJsonLd, branchLd, breadcrumbJsonLd, faqJsonLd, storeJsonLd } from "../lib/seoLd";
import { fmt, telLink, toFa } from "../lib/utils";

const paragraphs = (text) => String(text || "").split(/\n+/).filter(Boolean);

export { faqJsonLd, breadcrumbJsonLd, storeJsonLd };

// ---------- بلوک‌های مشترک ----------
export function FaqList({ items = [], title = "سؤالات متداول" }) {
  const [open, setOpen] = useState(0);
  if (!items.length) return null;
  return (
    <div className="faq">
      <h2>{title}</h2>
      {items.map((f, k) => (
        <div key={k} className={`faq-item ${open === k ? "on" : ""}`}>
          <button onClick={() => setOpen(open === k ? -1 : k)} aria-expanded={open === k}>
            <h3>{f.q}</h3>
            <span>{open === k ? "−" : "+"}</span>
          </button>
          <AnimatePresence initial={false}>
            {open === k && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <p>{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function BranchCards({ title = true }) {
  const { settings: S } = useApp();
  return (
    <section className="container section">
      {title && (
        <Reveal className="sec-head">
          <h2>شعبه‌های <span>{BRAND.name}</span></h2>
          <Link to="/branches/" className="link-more">همه شعبه‌ها <ArrowLeft size={16} /></Link>
        </Reveal>
      )}
      <div className="branches">
        {BRANCHES.map((b, i) => (
          <Reveal key={b.slug} delay={i * 0.07}>
            <Link to={`/branch/${b.slug}/`} className="branch-card">
              <motion.span className="branch-pin" whileHover={{ y: -6 }}><MapPin size={22} /></motion.span>
              <b>پت شاپ {b.name}</b>
              <small>شعبه {toFa(b.num)} • {b.city}</small>
              <span className="muted small">{b.address}</span>
              <span className="branch-actions">
                <span className="branch-call" onClick={(e) => { e.preventDefault(); window.location.href = telLink(S.phone); }}>
                  <Phone size={15} /> {toFa(S.phone)}
                </span>
                {b.neshan && (
                  <span className="branch-call branch-map" role="link" title={`مسیریابی شعبه ${b.name} در نشان`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(b.neshan, "_blank", "noopener"); }}>
                    <Navigation size={15} /> مسیریابی در نشان
                  </span>
                )}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ArticleCards({ limit, exclude, list, title = true }) {
  const items = (list || INDEX.articles).filter((a) => a.slug !== exclude).slice(0, limit || 999);
  if (!items.length) return null;
  return (
    <section className="container section">
      {title && (
        <Reveal className="sec-head">
          <h2>مجله <span>{BRAND.name}</span></h2>
          <Link to="/blog/" className="link-more">همه مقاله‌ها <ArrowLeft size={16} /></Link>
        </Reveal>
      )}
      <div className="articles">
        {items.map((a, i) => (
          <Reveal key={a.slug} delay={Math.min(i, 8) * 0.05}>
            <Link to={`/blog/${a.slug}/`} className="article-card">
              <span className="tag">{TOPICS[a.topic]?.icon} {CLUSTERS[a.cluster] || TOPICS[a.topic]?.name}</span>
              <h3>{a.title}</h3>
              <p className="muted small">{a.description}</p>
              <span className="link-more">ادامه مطلب <ArrowLeft size={15} /></span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// کارت‌های راهنماهای اصلی (سگ، گربه، پرنده، حیوانات کوچک)
export function GuideCards() {
  return (
    <section className="container section">
      <Reveal className="sec-head">
        <h2>راهنمای نگهداری <span>حیوانات خانگی</span></h2>
        <Link to="/blog/" className="link-more">مجله {BRAND.name} <ArrowLeft size={16} /></Link>
      </Reveal>
      <div className="guide-cards">
        {Object.entries(TOPICS).map(([t, info], i) => (
          <Reveal key={t} delay={i * 0.07}>
            <Link to={`/guide/${t}/`} className="guide-card">
              <motion.span className="guide-icon" whileHover={{ rotate: [0, -12, 12, 0] }}>{info.icon}</motion.span>
              <b>{info.label}</b>
              <small className="muted">{toFa(INDEX.articles.filter((a) => a.topic === t).length)} مقاله آموزشی</small>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// متن مقاله با فهرست و لینک داخلی
export function RichText({ text }) {
  const line = (t) => inline(t).map((x, k) => (x.href ? <Link key={k} to={x.href}>{x.text}</Link> : <span key={k}>{x.text}</span>));
  return blocks(text).map((b, i) => {
    if (b.type === "ul") return <ul key={i}>{b.items.map((t, k) => <li key={k}>{line(t)}</li>)}</ul>;
    if (b.type === "ol") return <ol key={i}>{b.items.map((t, k) => <li key={k}>{line(t)}</li>)}</ol>;
    return <p key={i}>{line(b.text)}</p>;
  });
}

// متن کامل مقاله/راهنما فقط هنگام باز شدن همان صفحه دانلود می‌شود
function useContent(path) {
  const [data, setData] = useState(undefined);
  useEffect(() => {
    let live = true;
    setData(undefined);
    fetch(path)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, [path]);
  return data;
}

function Intro({ data }) {
  return (
    <Reveal className="card prose seo-block">
      {paragraphs(data.intro).map((p, i) => <p key={i}>{p}</p>)}
    </Reveal>
  );
}

function ProductsOf({ filter }) {
  const { visibleProducts, productsLoading } = useApp();
  const list = visibleProducts.filter(filter);
  if (productsLoading && !visibleProducts.length) return <SkeletonGrid />;
  return <ProductGrid products={list} empty={<Empty icon="📦" title="به‌زودی محصولات این بخش اضافه می‌شود" />} />;
}

const Crumbs = ({ trail }) => (
  <nav className="crumbs" aria-label="مسیر">
    {trail.map(([name, path], i) => (
      <span key={path}>{i < trail.length - 1 ? <><Link to={path}>{name}</Link> / </> : <span>{name}</span>}</span>
    ))}
  </nav>
);

// ---------- صفحه دسته‌بندی /category/:slug ----------
export function CategoryPage() {
  const { slug } = useParams();
  const cat = categoryBySlug(slug);
  const data = SEO.categories.find((c) => c.slug === slug);
  if (!cat || !data) return <NotFoundBlock />;
  const path = `/category/${slug}/`;
  const trail = [["خانه", "/"], ["فروشگاه", "/shop"], [cat.name, path]];
  const articles = INDEX.articles.filter((a) => a.relatedCategory === slug);
  return (
    <div className="container section">
      <Seo title={data.title} description={data.description} path={path} jsonLd={[breadcrumbJsonLd(trail), faqJsonLd(data.faq)]} />
      <Crumbs trail={trail} />
      <div className="sec-head"><h1 className="h-title">{data.h1}</h1></div>
      <div className="chips scroll">
        {CATEGORIES.map((c) => <Link key={c.slug} to={`/category/${c.slug}/`} className={`chip ${c.slug === slug ? "on" : ""}`}>{c.icon} {c.name}</Link>)}
      </div>
      {LANDING.petCategories.some((x) => x.cat === slug) && (
        <div className="chips">
          {LANDING.petCategories.filter((x) => x.cat === slug).map((x) => <Link key={x.pet} to={petCatPath(x)} className="chip">{x.h1}</Link>)}
        </div>
      )}
      <ProductsOf filter={(p) => p.category === cat.name} />
      <div className="seo-wrap">
        <Intro data={data} />
        {articles.length > 0 && (
          <div className="card soft">
            <h2 className="card-title">راهنمای خرید</h2>
            {articles.map((a) => <Link key={a.slug} className="list-link row-between" to={`/blog/${a.slug}/`}>{a.title} <ArrowLeft size={15} /></Link>)}
          </div>
        )}
        <FaqList items={data.faq} />
      </div>
    </div>
  );
}

// ---------- صفحه حیوان /pet/:slug ----------
export function PetPage() {
  const { slug } = useParams();
  const data = SEO.pets.find((p) => p.slug === slug);
  if (!data) return <NotFoundBlock />;
  const path = `/pet/${slug}/`;
  const trail = [["خانه", "/"], [data.h1, path]];
  return (
    <div className="container section">
      <Seo title={data.title} description={data.description} path={path} jsonLd={breadcrumbJsonLd(trail)} />
      <Crumbs trail={trail} />
      <div className="sec-head"><h1 className="h-title">{data.h1}</h1></div>
      <div className="chips scroll">
        {LANDING.petCategories.filter((x) => x.pet === slug).map((x) => <Link key={x.cat} to={petCatPath(x)} className="chip">{CATEGORIES.find((c) => c.slug === x.cat)?.icon} {x.h1}</Link>)}
        <Link to="/brands/" className="chip">🏷️ برندها</Link>
      </div>
      <ProductsOf filter={(p) => p.pet === data.pet || p.pet === "سگ و گربه"} />
      <div className="seo-wrap">
        <Intro data={data} />
        <Link className="btn btn-ghost btn-block" to={`/guide/${slug}/`}><BookOpen size={17} /> راهنمای کامل نگهداری {data.pet}</Link>
      </div>
      <ArticleCards limit={6} list={INDEX.articles.filter((a) => a.topic === slug)} />
    </div>
  );
}

// ---------- شعبه‌ها ----------
export function BranchesPage() {
  const trail = [["خانه", "/"], ["شعبه‌ها", "/branches/"]];
  const kw = SEO.keywordMap.filter((k) => k.ownerPage?.startsWith("/branches")).map((k) => k.keyword);
  return (
    <div className="section">
      <Seo
        title="شعبه‌های پت شاپ موچولو در تهران و کرج"
        description="آدرس و تلفن شعبه‌های پت شاپ موچولو در تجریش، سعادت‌آباد، پونک، گوهردشت، عظیمیه و فردیس؛ غذا و لوازم اصل سگ و گربه با مشاوره رایگان."
        path="/branches/"
        jsonLd={[breadcrumbJsonLd(trail), storeJsonLd()]}
      />
      <div className="container"><Crumbs trail={trail} /><h1 className="h-title">شعبه‌های پت شاپ {BRAND.name} در تهران و کرج</h1>
        {kw.length > 0 && <p className="muted">{BRAND.siteName} با ۶ شعبه در تهران (تجریش، سعادت‌آباد و پونک) و کرج (گوهردشت، عظیمیه و فردیس) آماده خدمت است. با زدن «مسیریابی در نشان» موقعیت هر شعبه مستقیم در نقشه نشان باز می‌شود.</p>}
      </div>
      <BranchCards title={false} />
    </div>
  );
}

export function BranchPage() {
  const { slug } = useParams();
  const { settings: S } = useApp();
  const b = BRANCHES.find((x) => x.slug === slug);
  const data = SEO.branches.find((x) => x.slug === slug);
  if (!b || !data) return <NotFoundBlock />;
  const path = `/branch/${slug}/`;
  const trail = [["خانه", "/"], ["شعبه‌ها", "/branches/"], [`شعبه ${b.name}`, path]];
  return (
    <div className="container section">
      <Seo title={data.title} description={data.description} path={path} jsonLd={[breadcrumbJsonLd(trail), { "@context": "https://schema.org", ...branchLd(b, S.phone) }]} />
      <Crumbs trail={trail} />
      <div className="branch-hero card">
        <div>
          <h1 className="h-title">{data.h1}</h1>
          <ul className="contact-list">
            <li><MapPin size={17} /> {b.neshan ? <a href={b.neshan} target="_blank" rel="noopener">{b.address}</a> : b.address}</li>
            <li><Phone size={17} /> <a href={telLink(S.phone)}>{toFa(S.phone)}</a></li>
            {S.instagram && <li><Instagram size={17} /> <a href={`https://www.instagram.com/${S.instagram}/`} target="_blank" rel="noopener noreferrer" dir="ltr">@{S.instagram}</a></li>}
          </ul>
          <div className="row-gap">
            {b.neshan && <a className="btn btn-p" href={b.neshan} target="_blank" rel="noopener"><Navigation size={17} /> مسیریابی در نشان</a>}
            <a className={`btn ${b.neshan ? "btn-ghost" : "btn-p"}`} href={telLink(S.phone)}><Phone size={17} /> تماس و استعلام موجودی</a>
            <Link className="btn btn-ghost" to="/shop">خرید آنلاین</Link>
          </div>
        </div>
        <motion.div className="branch-art" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>📍</motion.div>
      </div>
      <div className="seo-wrap"><Intro data={data} /></div>
      <h2 className="sub-title">شعبه‌های دیگر</h2>
      <div className="chips">
        {BRANCHES.filter((x) => x.slug !== slug).map((x) => <Link key={x.slug} className="chip" to={`/branch/${x.slug}/`}>پت شاپ {x.name}</Link>)}
      </div>
    </div>
  );
}

// ---------- مجله ----------
export function BlogPage() {
  const [sp, setSp] = useSearchParams();
  const topic = TOPICS[sp.get("t")] ? sp.get("t") : "";
  const trail = [["خانه", "/"], ["مجله", "/blog/"]];
  const list = INDEX.articles.filter((a) => !topic || a.topic === topic);
  return (
    <div className="section">
      <Seo
        title="مجله موچولو؛ آموزش نگهداری سگ، گربه، پرنده و حیوانات خانگی"
        description="آموزش، تغذیه، سلامت و خرید سگ، گربه، مرغ عشق، طوطی، همستر و خرگوش؛ مقاله‌های کاربردی و دقیق از تیم پت شاپ موچولو."
        path="/blog/"
        jsonLd={breadcrumbJsonLd(trail)}
      />
      <div className="container">
        <Crumbs trail={trail} />
        <h1 className="h-title">مجله <span>{BRAND.name}</span>: راهنمای نگهداری حیوانات خانگی</h1>
        <div className="chips scroll">
          <button className={`chip ${!topic ? "on" : ""}`} onClick={() => setSp({})}>همه ({toFa(INDEX.articles.length)})</button>
          {Object.entries(TOPICS).map(([t, info]) => (
            <button key={t} className={`chip ${topic === t ? "on" : ""}`} onClick={() => setSp({ t })}>{info.icon} {info.name}</button>
          ))}
        </div>
        {topic && <Link className="link-more" to={`/guide/${topic}/`}><BookOpen size={15} /> راهنمای کامل {TOPICS[topic].name}</Link>}
      </div>
      <ArticleCards list={list} title={false} />
    </div>
  );
}

function ArticleBody({ a }) {
  return (
    <>
      {a.summary && (
        <div className="answer-box">
          <b>پاسخ کوتاه</b>
          <RichText text={a.summary} />
        </div>
      )}
      {a.sections?.map((s, i) => (
        <section key={i}>
          <h2>{s.h2}</h2>
          <RichText text={s.body} />
        </section>
      ))}
    </>
  );
}

export function ArticlePage() {
  const { slug } = useParams();
  const meta = INDEX.articles.find((x) => x.slug === slug);
  const a = useContent(`/content/articles/${slug}.json`);
  if (!meta) return <NotFoundBlock />;
  const path = `/blog/${slug}/`;
  const topic = TOPICS[meta.topic];
  const trail = [["خانه", "/"], ["مجله", "/blog/"], [topic.name, `/guide/${meta.topic}/`], [meta.title, path]];
  const cat = CATEGORIES.find((c) => c.slug === meta.relatedCategory);
  const related = (a?.related || []).map((r) => INDEX.articles.find((x) => x.slug === r)).filter(Boolean);
  const more = [...related, ...INDEX.articles.filter((x) => x.topic === meta.topic && x.slug !== slug && !related.includes(x))].slice(0, 3);
  return (
    <div className="container section narrow">
      <Seo title={meta.title} description={meta.description} path={path} jsonLd={[articleJsonLd(meta, path), breadcrumbJsonLd(trail), a && faqJsonLd(a.faq)].filter(Boolean)} />
      <Crumbs trail={trail} />
      <article className="card prose article">
        <h1 className="h-title">{a?.h1 || meta.title}</h1>
        <div className="article-meta muted small">
          <span><User size={14} /> {a?.author || "تیم موچولو"}</span>
          <span><Calendar size={14} /> {new Date(meta.date).toLocaleDateString("fa-IR")}</span>
          {meta.readMinutes > 0 && <span><Clock size={14} /> {toFa(meta.readMinutes)} دقیقه مطالعه</span>}
        </div>
        {a === undefined ? <div className="center-load"><Spinner /></div> : a ? <ArticleBody a={a} /> : <p>بارگذاری مقاله ممکن نشد؛ صفحه را دوباره باز کنید.</p>}
        <div className="alert alert-ok">
          📚 <Link to={`/guide/${meta.topic}/`}>راهنمای کامل نگهداری {topic.name}</Link>
          {cat && <> — محصولات مرتبط: <Link to={`/category/${cat.slug}/`}>{cat.name} در فروشگاه {BRAND.name}</Link></>}
        </div>
        {a && <FaqList items={a.faq} />}
      </article>
      <ArticleCards list={more} title={false} />
    </div>
  );
}

// ---------- راهنمای اصلی هر حیوان /guide/:topic ----------
export function GuidePage() {
  const { topic } = useParams();
  const info = TOPICS[topic];
  const meta = INDEX.guides.find((g) => g.topic === topic);
  const g = useContent(`/content/guides/${topic}.json`);
  if (!info || !meta) return <NotFoundBlock />;
  const path = `/guide/${topic}/`;
  const trail = [["خانه", "/"], ["مجله", "/blog/"], [info.name, path]];
  const list = INDEX.articles.filter((a) => a.topic === topic);
  const groups = Object.entries(CLUSTERS).map(([c, name]) => [name, list.filter((a) => a.cluster === c)]).filter(([, l]) => l.length);
  return (
    <div className="section">
      <Seo title={meta.title} description={meta.description} path={path} jsonLd={[articleJsonLd({ ...meta, date: g?.date || "2026-11-03" }, path), breadcrumbJsonLd(trail), g && faqJsonLd(g.faq)].filter(Boolean)} />
      <div className="container narrow">
        <Crumbs trail={trail} />
        <article className="card prose article">
          <h1 className="h-title">{info.icon} {meta.h1}</h1>
          {g === undefined ? <div className="center-load"><Spinner /></div> : g && <ArticleBody a={g} />}
          {(topic === "dog" || topic === "cat") && (
            <Link className="btn btn-p btn-block" to={`/pet/${topic}/`}>🛒 خرید غذا و لوازم {info.name} از {BRAND.name}</Link>
          )}
        </article>
      </div>
      {groups.map(([name, l]) => (
        <div key={name}>
          <div className="container"><h2 className="sub-title">{name}</h2></div>
          <ArticleCards list={l} title={false} />
        </div>
      ))}
      {g && <div className="container narrow"><FaqList items={g.faq} /></div>}
    </div>
  );
}

// ---------- صفحه دسته + حیوان /category/:slug/:pet (مثل غذای خشک گربه) ----------
function PriceLine({ list, label }) {
  const r = priceRange(list);
  if (!r) return null;
  return <p className="muted small">{label}: {toFa(list.length)} محصول، قیمت از {fmt(r.min)}{r.max > r.min ? ` تا ${fmt(r.max)}` : ""}.</p>;
}

export function PetCategoryPage() {
  const { slug, pet } = useParams();
  const { visibleProducts } = useApp();
  const cat = categoryBySlug(slug);
  const data = LANDING.petCategories.find((x) => x.cat === slug && x.pet === pet);
  if (!cat || !data) return <NotFoundBlock />;
  const path = petCatPath(data);
  const petName = PET_SLUGS[pet];
  const trail = [["خانه", "/"], ["فروشگاه", "/shop"], [cat.name, `/category/${slug}/`], [data.h1, path]];
  const list = petCatProducts(visibleProducts, cat.name, pet);
  const articles = INDEX.articles.filter((a) => a.relatedCategory === slug && (a.topic === pet || a.topic === "general")).slice(0, 8);
  const brands = LANDING.brands.filter((b) => list.some((p) => brandOf(p, LANDING.brands)?.slug === b.slug));
  return (
    <div className="container section">
      <Seo title={data.title} description={data.description} path={path} jsonLd={[breadcrumbJsonLd(trail), faqJsonLd(data.faq), itemListLd(list, SITE_URL, data.h1)].filter(Boolean)} />
      <Crumbs trail={trail} />
      <div className="sec-head"><h1 className="h-title">{data.h1}</h1></div>
      <PriceLine list={list} label={data.h1} />
      <div className="chips scroll">
        {LANDING.petCategories.filter((x) => x.pet === pet).map((x) => <Link key={x.cat} to={petCatPath(x)} className={`chip ${x.cat === slug ? "on" : ""}`}>{x.h1}</Link>)}
        <Link to={`/pet/${pet}/`} className="chip">همه محصولات {petName}</Link>
      </div>
      <ProductsOf filter={(p) => list.includes(p)} />
      <div className="seo-wrap">
        <Intro data={data} />
        {brands.length > 0 && (
          <div className="card soft">
            <h2 className="card-title">برندهای {data.h1}</h2>
            <div className="chips">{brands.map((b) => <Link key={b.slug} className="chip" to={brandPath(b)}>{b.name} ({b.latin})</Link>)}</div>
          </div>
        )}
        {articles.length > 0 && (
          <div className="card soft">
            <h2 className="card-title">راهنمای خرید {data.h1}</h2>
            {articles.map((a) => <Link key={a.slug} className="list-link row-between" to={`/blog/${a.slug}/`}>{a.title} <ArrowLeft size={15} /></Link>)}
          </div>
        )}
        <FaqList items={data.faq} />
      </div>
    </div>
  );
}

// ---------- برندها /brands و /brand/:slug ----------
export function BrandsPage() {
  const { visibleProducts } = useApp();
  const trail = [["خانه", "/"], ["برندها", "/brands/"]];
  return (
    <div className="container section">
      <Seo title="برندهای غذا و لوازم سگ و گربه در موچولو" description={`خرید محصولات اصل ${LANDING.brands.slice(0, 8).map((b) => b.name).join("، ")} و برندهای دیگر غذا، تشویقی، مکمل و لوازم سگ و گربه در پت شاپ موچولو.`} path="/brands/" jsonLd={breadcrumbJsonLd(trail)} />
      <Crumbs trail={trail} />
      <h1 className="h-title">برندهای غذا و لوازم سگ و گربه</h1>
      <div className="brand-grid">
        {LANDING.brands.map((b) => (
          <Link key={b.slug} to={brandPath(b)} className="card brand-card">
            <b>{b.name}</b>
            <span dir="ltr" className="muted small">{b.latin}</span>
            <small className="muted">{toFa(brandProducts(visibleProducts, b, LANDING.brands).length)} محصول</small>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BrandPage() {
  const { slug } = useParams();
  const { visibleProducts } = useApp();
  const b = LANDING.brands.find((x) => x.slug === slug);
  if (!b) return <NotFoundBlock />;
  const path = brandPath(b);
  const list = brandProducts(visibleProducts, b, LANDING.brands);
  const trail = [["خانه", "/"], ["برندها", "/brands/"], [b.name, path]];
  const title = `محصولات ${b.name} (${b.latin})؛ خرید اصل با قیمت به‌روز`;
  const description = b.intro.split(/\n/)[0].slice(0, 158);
  const cats = [...new Set(list.map((p) => p.category))];
  return (
    <div className="container section">
      <Seo title={title} description={description} path={path} jsonLd={[breadcrumbJsonLd(trail), faqJsonLd(b.faq), itemListLd(list, SITE_URL, `محصولات ${b.name}`), { "@context": "https://schema.org", "@type": "Brand", name: b.latin, alternateName: b.name, url: SITE_URL + path }].filter(Boolean)} />
      <Crumbs trail={trail} />
      <div className="sec-head"><h1 className="h-title">محصولات {b.name} <span dir="ltr">{b.latin}</span></h1></div>
      <PriceLine list={list} label={`محصولات ${b.name} در موچولو`} />
      <ProductsOf filter={(p) => list.includes(p)} />
      <div className="seo-wrap">
        <Intro data={b} />
        {cats.length > 0 && (
          <div className="card soft">
            <h2 className="card-title">دسته‌بندی‌های مرتبط</h2>
            <div className="chips">{cats.map((c) => <Link key={c} className="chip" to={categoryUrl(c)}>{c}</Link>)}</div>
          </div>
        )}
        <FaqList items={b.faq} />
        <h2 className="sub-title">برندهای دیگر</h2>
        <div className="chips">{LANDING.brands.filter((x) => x.slug !== slug).map((x) => <Link key={x.slug} className="chip" to={brandPath(x)}>{x.name}</Link>)}</div>
      </div>
    </div>
  );
}

function NotFoundBlock() {
  return (
    <div className="container section">
      <Seo title="صفحه پیدا نشد" noindex />
      <Empty icon="🙀" title="این صفحه پیدا نشد"><Link className="btn btn-p" to="/">بازگشت به خانه</Link></Empty>
    </div>
  );
}
