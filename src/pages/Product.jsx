import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Minus, Phone, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Empty, Img, Seo, useImageSrc } from "../components/ui";
import ProductCard from "../components/ProductCard";
import { SITE_URL, categoryUrl } from "../config";
import { breadcrumbJsonLd, productJsonLd } from "../lib/seoLd";
import { fmt, telLink, toFa, waLink } from "../lib/utils";
import { productGuide, productTitle } from "../lib/productGuide";
import CONTENT from "../data/contentIndex.json";

function Gallery({ images, name }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(null);
  const current = images[i];
  return (
    <div className="gallery">
      <div
        className="gallery-main"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="gallery-frame">
            <Img src={current} alt={name} style={zoom ? { transformOrigin: zoom, transform: "scale(1.8)" } : undefined} />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, k) => (
            <button key={src} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`تصویر ${k + 1}`}>
              <Img src={src} small alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const { products, visibleProducts, addToCart, wishlist, toggleWish, settings: S, productsLoading } = useApp();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const p = products.find((x) => x.slug === slug || x.id === slug);
  const firstImg = useImageSrc(p?.images?.[0] || p?.imageUrl);

  if (!p || p.active === false)
    return productsLoading ? (
      <div className="center-load"><span className="spinner" /></div>
    ) : (
      <div className="container section">
        <Seo title="محصول پیدا نشد" noindex />
        <Empty icon="🙀" title="این محصول پیدا نشد"><Link className="btn btn-p" to="/shop">رفتن به فروشگاه</Link></Empty>
      </div>
    );

  const images = (p.images?.length ? p.images : [p.imageUrl]).filter(Boolean);
  const priced = Number(p.price) > 0;
  const out = priced && Number(p.stock) < 1;
  const off = priced && Number(p.comparePrice) > Number(p.price) ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
  const related = visibleProducts.filter((x) => x.id !== p.id && (x.category === p.category || x.pet === p.pet)).slice(0, 4);
  const guide = productGuide(p);
  const guideLinks = guide.slugs.map((s) => CONTENT.articles.find((a) => a.slug === s)).filter(Boolean);
  const url = `/p/${p.slug || p.id}`;
  const absImg = firstImg?.startsWith("/") ? SITE_URL + firstImg : undefined;

  const jsonLd = [
    productJsonLd(p, absImg),
    breadcrumbJsonLd([["خانه", "/"], ["فروشگاه", "/shop"], [p.category, categoryUrl(p.category)], [p.name, `${url}/`]]),
  ];

  const add = () => {
    addToCart(p, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="container section">
      <Seo title={productTitle(p)} description={`خرید ${p.name} اصل از پت شاپ موچولو. ${p.desc}`.slice(0, 160)} path={`${url}/`} image={absImg} jsonLd={jsonLd} />
      <nav className="crumbs">
        <Link to="/">خانه</Link> / <Link to="/shop">فروشگاه</Link> / <Link to={categoryUrl(p.category)}>{p.category}</Link> / <span>{p.name}</span>
      </nav>
      <div className="product">
        <Gallery images={images} name={p.name} />
        <motion.div className="product-info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="pcard-meta">{[p.brand, p.category, p.pet].filter(Boolean).join(" • ")}</div>
          <h1>{p.name}</h1>
          {p.badge && <span className="tag">{p.badge}</span>}
          <p className="lead">{p.desc}</p>
          {p.features?.length > 0 && (
            <ul className="features">
              {p.features.map((f, k) => (
                <motion.li key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + k * 0.06 }}><Check size={16} /> {f}</motion.li>
              ))}
            </ul>
          )}
          <div className="buy-box">
            {priced ? (
              <>
                <div className="buy-price">
                  {off > 0 && <><del>{fmt(p.comparePrice)}</del><span className="tag tag-hot">٪{toFa(off)}</span></>}
                  <b>{fmt(p.price)}</b>
                </div>
                <div className={`stock ${out ? "out" : Number(p.stock) <= 3 ? "low" : ""}`}>
                  {out ? "ناموجود" : Number(p.stock) <= 3 ? `فقط ${toFa(p.stock)} عدد باقی مانده!` : "موجود در انبار"}
                </div>
                {!out && (
                  <div className="buy-row">
                    <div className="qty">
                      <button onClick={() => setQty((q) => Math.min(q + 1, Number(p.stock) || 99))} aria-label="افزایش"><Plus size={16} /></button>
                      <span>{toFa(qty)}</span>
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="کاهش"><Minus size={16} /></button>
                    </div>
                    <motion.button className={`btn btn-p btn-lg grow ${added ? "is-added" : ""}`} onClick={add} whileTap={{ scale: 0.96 }}>
                      {added ? <><Check size={18} /> به سبد اضافه شد</> : <><ShoppingBag size={18} /> افزودن به سبد خرید</>}
                    </motion.button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="price-soon big">قیمت این محصول را تلفنی استعلام کنید</div>
                <div className="buy-row">
                  <a className="btn btn-p grow" href={telLink(S.phone)}><Phone size={17} /> تماس: {toFa(S.phone)}</a>
                  <a className="btn btn-ghost" href={waLink(S.phone, `سلام، قیمت «${p.name}» رو می‌خواستم`)} target="_blank" rel="noopener noreferrer">واتساپ</a>
                </div>
              </>
            )}
            <button className={`btn btn-ghost btn-block ${wishlist.includes(p.id) ? "wished" : ""}`} onClick={() => toggleWish(p.id)}>
              <Heart size={17} fill={wishlist.includes(p.id) ? "currentColor" : "none"} /> {wishlist.includes(p.id) ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            </button>
          </div>
          <div className="assure">
            <div><Truck size={20} /> ارسال سریع و رایگان در تهران</div>
            <div><ShieldCheck size={20} /> ضمانت اصالت و تاریخ مصرف</div>
          </div>
        </motion.div>
      </div>

      {(guide.tips.length > 0 || guide.perKg > 0) && (
        <section className="section">
          <div className="sec-head"><h2>راهنمای <span>خرید و استفاده</span></h2></div>
          <div className="card soft product-guide">
            {guide.perKg > 0 && <p><b>قیمت هر کیلو:</b> حدود {fmt(guide.perKg)}</p>}
            {guide.tips.length > 0 && <ul>{guide.tips.map((t) => <li key={t}>{t}</li>)}</ul>}
            {guideLinks.length > 0 && (
              <>
                <h3>مطالب مفید پیش از خرید</h3>
                <ul>{guideLinks.map((a) => <li key={a.slug}><Link to={`/blog/${a.slug}/`}>{a.title}</Link></li>)}</ul>
              </>
            )}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <div className="sec-head"><h2>محصولات <span>مرتبط</span></h2></div>
          <div className="grid">{related.map((r, i) => <ProductCard key={r.id} product={r} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}
