import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Calendar, Instagram, MapPin, Phone, User } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Empty, Reveal, Seo } from "../components/ui";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { BRAND, BRANCHES, CATEGORIES, SITE_URL, categoryBySlug, categoryUrl } from "../config";
import SEO from "../data/seo.json";
import { articleJsonLd, branchLd, breadcrumbJsonLd, faqJsonLd, storeJsonLd } from "../lib/seoLd";
import { telLink, toFa } from "../lib/utils";

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
              <small>{b.city}{b.main ? " • شعبه اصلی" : ""}</small>
              <span className="muted small">{b.address}</span>
              <span className="branch-call" onClick={(e) => { e.preventDefault(); window.location.href = telLink(S.phone); }}>
                <Phone size={15} /> {toFa(S.phone)}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ArticleCards({ limit, exclude }) {
  const list = SEO.articles.filter((a) => a.slug !== exclude).slice(0, limit || 99);
  return (
    <section className="container section">
      <Reveal className="sec-head">
        <h2>مجله <span>{BRAND.name}</span></h2>
        <Link to="/blog/" className="link-more">همه مقاله‌ها <ArrowLeft size={16} /></Link>
      </Reveal>
      <div className="articles">
        {list.map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.06}>
            <Link to={`/blog/${a.slug}/`} className="article-card">
              <span className="tag">{a.relatedCategory}</span>
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
  const articles = SEO.articles.filter((a) => a.relatedCategory === cat.name);
  return (
    <div className="container section">
      <Seo title={data.title} description={data.description} path={path} jsonLd={[breadcrumbJsonLd(trail), faqJsonLd(data.faq)]} />
      <Crumbs trail={trail} />
      <div className="sec-head"><h1 className="h-title">{data.h1}</h1></div>
      <div className="chips scroll">
        {CATEGORIES.map((c) => <Link key={c.slug} to={`/category/${c.slug}/`} className={`chip ${c.slug === slug ? "on" : ""}`}>{c.icon} {c.name}</Link>)}
      </div>
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
        {CATEGORIES.map((c) => <Link key={c.slug} to={`/category/${c.slug}/`} className="chip">{c.icon} {c.name}</Link>)}
      </div>
      <ProductsOf filter={(p) => p.pet === data.pet || p.pet === "سگ و گربه"} />
      <div className="seo-wrap"><Intro data={data} /></div>
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
        description="آدرس و تلفن شعبه‌های پت شاپ موچولو در تجریش، تهرانپارس، مهرشهر و فردیس؛ غذا و لوازم اصل سگ و گربه با مشاوره رایگان."
        path="/branches/"
        jsonLd={[breadcrumbJsonLd(trail), storeJsonLd()]}
      />
      <div className="container"><Crumbs trail={trail} /><h1 className="h-title">شعبه‌های پت شاپ {BRAND.name} در تهران و کرج</h1>
        {kw.length > 0 && <p className="muted">{BRAND.siteName} با ۴ شعبه در تهران (تجریش و تهرانپارس) و کرج (مهرشهر و فردیس) آماده خدمت است. برای نشانی دقیق و موجودی هر شعبه تماس بگیرید.</p>}
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
            <li><MapPin size={17} /> {b.address}</li>
            <li><Phone size={17} /> <a href={telLink(S.phone)}>{toFa(S.phone)}</a></li>
            {S.instagram && <li><Instagram size={17} /> <a href={`https://www.instagram.com/${S.instagram}/`} target="_blank" rel="noopener noreferrer" dir="ltr">@{S.instagram}</a></li>}
          </ul>
          <div className="row-gap">
            <a className="btn btn-p" href={telLink(S.phone)}><Phone size={17} /> تماس و استعلام موجودی</a>
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
  const trail = [["خانه", "/"], ["مجله", "/blog/"]];
  return (
    <div className="section">
      <Seo title="مجله موچولو؛ راهنمای تغذیه و نگهداری سگ و گربه" description="مقاله‌های کاربردی درباره غذای گربه و سگ، شیرخشک بچه گربه، مکمل‌ها و بازی با حیوان خانگی؛ از تیم پت شاپ موچولو." path="/blog/" jsonLd={breadcrumbJsonLd(trail)} />
      <div className="container"><Crumbs trail={trail} /><h1 className="h-title">مجله <span>{BRAND.name}</span>: راهنمای نگهداری سگ و گربه</h1></div>
      <ArticleCards />
    </div>
  );
}

export function ArticlePage() {
  const { slug } = useParams();
  const a = SEO.articles.find((x) => x.slug === slug);
  if (!a) return <NotFoundBlock />;
  const path = `/blog/${slug}/`;
  const trail = [["خانه", "/"], ["مجله", "/blog/"], [a.title, path]];
  const jsonLd = articleJsonLd(a, path);
  return (
    <div className="container section narrow">
      <Seo title={a.title} description={a.description} path={path} jsonLd={[jsonLd, breadcrumbJsonLd(trail), faqJsonLd(a.faq)]} />
      <Crumbs trail={trail} />
      <article className="card prose article">
        <h1 className="h-title">{a.h1}</h1>
        <div className="article-meta muted small">
          <span><User size={14} /> {a.author}</span>
          <span><Calendar size={14} /> {new Date(a.date).toLocaleDateString("fa-IR")}</span>
        </div>
        {a.sections.map((s, i) => (
          <section key={i}>
            <h2>{s.h2}</h2>
            {paragraphs(s.body).map((p, k) => <p key={k}>{p}</p>)}
          </section>
        ))}
        <div className="alert alert-ok">
          محصولات مرتبط: <Link to={categoryUrl(a.relatedCategory)}>{a.relatedCategory} در فروشگاه {BRAND.name}</Link>
        </div>
        <FaqList items={a.faq} />
      </article>
      <ArticleCards limit={3} exclude={slug} />
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
