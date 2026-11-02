// بعد از vite build: برای همه صفحه‌های عمومی یک HTML کامل (عنوان، توضیحات، canonical، OG، JSON-LD و متن اصلی) می‌سازد
// تا گوگل و دستیارهای هوش مصنوعی بدون اجرای جاوااسکریپت هم کل محتوا را ببینند. React بعد از بارگذاری همین محتوا را نمایش می‌دهد.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND, BRANCHES, CATEGORIES, SITE_URL } from "../src/config.js";
import { SEED_PRODUCTS } from "../src/data/seedProducts.js";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, fullTitle, productJsonLd, storeJsonLd } from "../src/lib/seoLd.js";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const SEO = JSON.parse(await readFile(new URL("../src/data/seo.json", import.meta.url), "utf8"));
const FIREBASE = JSON.parse(await readFile(new URL("../src/firebase.config.json", import.meta.url), "utf8"));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const paras = (t) => String(t || "").split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("");
const faqHtml = (items = []) => (items.length ? `<h2>سؤالات متداول</h2>${items.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}` : "");
const crumbs = (trail) => `<nav>${trail.map(([n, p]) => `<a href="${p}">${esc(n)}</a>`).join(" / ")}</nav>`;

function fromFirestore(v) {
  if (!v) return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromFirestore);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromFirestore(x)]));
  return undefined;
}
async function loadProducts() {
  try {
    const out = [];
    let token = "";
    do {
      const r = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/products?pageSize=300&key=${FIREBASE.apiKey}${token ? `&pageToken=${token}` : ""}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      for (const d of j.documents || []) out.push({ id: d.name.split("/").pop(), ...fromFirestore({ mapValue: { fields: d.fields } }) });
      token = j.nextPageToken || "";
    } while (token);
    if (out.length) return out;
    throw new Error("empty");
  } catch (e) {
    console.log(`prerender: محصولات از Firestore خوانده نشد (${e.message}) — استفاده از محصولات اولیه`);
    return SEED_PRODUCTS;
  }
}

const template = await readFile(join(DIST, "index.html"), "utf8");
// قالب خالی برای مسیرهای خصوصی SPA (پنل، سبد، حساب) — netlify.toml به این فایل redirect می‌کند
await writeFile(join(DIST, "app.html"), template.replace("<head>", '<head>\n    <meta name="robots" content="noindex" />'));

function page({ title, description, path, image, jsonLd = [], body }) {
  const full = fullTitle(title, SEO.home.title);
  const url = SITE_URL + path;
  let html = template
    .replace(/<title[^>]*>[\s\S]*?<\/title>/, `<title data-static>${esc(full)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" data-static content="${esc(description)}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" data-static href="${url}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" data-static content="${esc(full)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" data-static content="${esc(description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" data-static content="${url}" />`);
  if (image) html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" data-static content="${image.startsWith("http") ? image : SITE_URL + image}" />`);
  const ld = [].concat(jsonLd).filter(Boolean).map((j) => `<script type="application/ld+json" data-static>${JSON.stringify(j)}</script>`).join("\n    ");
  if (ld) html = html.replace("</head>", `    ${ld}\n  </head>`);
  const nav = `<header><a href="/">${esc(BRAND.siteName)}</a> · <a href="/shop/">فروشگاه</a> · <a href="/branches/">شعبه‌ها</a> · <a href="/blog/">مجله</a> · <a href="/contact/">تماس: ۰۹۱۹۱۰۰۱۹۴۷</a></header>`;
  return html.replace('<div id="root"></div>', `<div id="root"><div class="prerender" style="max-width:960px;margin:24px auto;padding:16px;font-family:Tahoma,sans-serif;line-height:1.9">${nav}<main>${body}</main></div></div>`);
}

const urls = [];
async function emit(path, opts, extra = {}) {
  const dir = join(DIST, ...path.split("/").filter(Boolean));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), page({ ...opts, path }));
  urls.push({ path, ...extra });
}

const products = (await loadProducts()).filter((p) => p.active !== false);
const pUrl = (p) => `/p/${p.slug || p.id}/`;
const productList = (list) =>
  `<ul>${list.map((p) => `<li><a href="${pUrl(p)}">${esc(p.name)}</a>${Number(p.price) > 0 ? ` — ${Number(p.price).toLocaleString("fa-IR")} تومان` : ""}</li>`).join("")}</ul>`;
const catSlug = (name) => CATEGORIES.find((c) => c.name === name)?.slug;
const branchList = `<ul>${BRANCHES.map((b) => `<li><a href="/branch/${b.slug}/">پت شاپ ${esc(b.name)}</a> — ${esc(b.address)}</li>`).join("")}</ul>`;

// صفحه اصلی
await emit(
  "/",
  {
    title: SEO.home.title,
    description: SEO.home.description,
    image: "/brand/europet-banner.webp",
    jsonLd: [storeJsonLd(), faqJsonLd(SEO.home.faq)],
    body: `<h1>${esc(SEO.home.h1)}</h1>${paras(SEO.home.intro)}
<h2>دسته‌بندی محصولات</h2><ul>${CATEGORIES.map((c) => `<li><a href="/category/${c.slug}/">${esc(c.name)}</a></li>`).join("")}</ul>
<h2>برای گربه و سگ</h2><ul><li><a href="/pet/cat/">لوازم و غذای گربه</a></li><li><a href="/pet/dog/">لوازم و غذای سگ</a></li></ul>
<h2>شعبه‌های ${esc(BRAND.name)}</h2>${branchList}
<h2>محصولات</h2>${productList(products)}
<h2>مجله ${esc(BRAND.name)}</h2><ul>${SEO.articles.map((a) => `<li><a href="/blog/${a.slug}/">${esc(a.title)}</a></li>`).join("")}</ul>
${faqHtml(SEO.home.faq)}<p>اینستاگرام: <a href="https://www.instagram.com/${BRAND.instagram}/">@${BRAND.instagram}</a></p>`,
  },
  { priority: "1.0", changefreq: "daily" },
);

// فروشگاه
await emit(
  "/shop/",
  {
    title: "فروشگاه آنلاین غذا و لوازم سگ و گربه",
    description: "خرید آنلاین غذای خشک و مرطوب، تشویقی، مکمل، شیرخشک، اسباب‌بازی، لباس و لوازم سگ و گربه از برندهای اصل در پت شاپ موچولو.",
    jsonLd: breadcrumbJsonLd([["خانه", "/"], ["فروشگاه", "/shop/"]]),
    body: `<h1>فروشگاه آنلاین ${esc(BRAND.siteName)}</h1>${productList(products)}`,
  },
  { priority: "0.8", changefreq: "daily" },
);

// دسته‌بندی‌ها
for (const c of SEO.categories) {
  const path = `/category/${c.slug}/`;
  const trail = [["خانه", "/"], ["فروشگاه", "/shop/"], [c.name, path]];
  const related = SEO.articles.filter((a) => a.relatedCategory === c.name);
  await emit(
    path,
    {
      title: c.title,
      description: c.description,
      jsonLd: [breadcrumbJsonLd(trail), faqJsonLd(c.faq)],
      body: `${crumbs(trail)}<h1>${esc(c.h1)}</h1>${productList(products.filter((p) => p.category === c.name))}${paras(c.intro)}${
        related.length ? `<h2>راهنمای خرید</h2><ul>${related.map((a) => `<li><a href="/blog/${a.slug}/">${esc(a.title)}</a></li>`).join("")}</ul>` : ""
      }${faqHtml(c.faq)}`,
    },
    { priority: "0.9", changefreq: "weekly" },
  );
}

// گربه و سگ
for (const pet of SEO.pets) {
  const path = `/pet/${pet.slug}/`;
  const trail = [["خانه", "/"], [pet.h1, path]];
  await emit(
    path,
    {
      title: pet.title,
      description: pet.description,
      jsonLd: breadcrumbJsonLd(trail),
      body: `${crumbs(trail)}<h1>${esc(pet.h1)}</h1>${productList(products.filter((p) => p.pet === pet.pet || p.pet === "سگ و گربه"))}${paras(pet.intro)}`,
    },
    { priority: "0.9", changefreq: "weekly" },
  );
}

// شعبه‌ها
await emit(
  "/branches/",
  {
    title: "شعبه‌های پت شاپ موچولو در تهران و کرج",
    description: "آدرس و تلفن شعبه‌های پت شاپ موچولو در تجریش، تهرانپارس، مهرشهر و فردیس؛ غذا و لوازم اصل سگ و گربه با مشاوره رایگان.",
    jsonLd: [breadcrumbJsonLd([["خانه", "/"], ["شعبه‌ها", "/branches/"]]), storeJsonLd()],
    body: `<h1>شعبه‌های پت شاپ ${esc(BRAND.name)} در تهران و کرج</h1>${branchList}<p>تلفن: ۰۹۱۹۱۰۰۱۹۴۷</p>`,
  },
  { priority: "0.8" },
);
for (const b of SEO.branches) {
  const info = BRANCHES.find((x) => x.slug === b.slug);
  const path = `/branch/${b.slug}/`;
  const trail = [["خانه", "/"], ["شعبه‌ها", "/branches/"], [`شعبه ${b.name}`, path]];
  const ld = storeJsonLd()["@graph"].find((g) => g["@id"]?.includes(`/branch/${b.slug}/`));
  await emit(
    path,
    {
      title: b.title,
      description: b.description,
      jsonLd: [breadcrumbJsonLd(trail), { "@context": "https://schema.org", ...ld }],
      body: `${crumbs(trail)}<h1>${esc(b.h1)}</h1><p>نشانی: ${esc(info?.address)} — تلفن: ۰۹۱۹۱۰۰۱۹۴۷</p>${paras(b.intro)}<h2>شعبه‌های دیگر</h2>${branchList}`,
    },
    { priority: "0.8" },
  );
}

// مجله
await emit(
  "/blog/",
  {
    title: "مجله موچولو؛ راهنمای تغذیه و نگهداری سگ و گربه",
    description: "مقاله‌های کاربردی درباره غذای گربه و سگ، شیرخشک بچه گربه، مکمل‌ها و بازی با حیوان خانگی؛ از تیم پت شاپ موچولو.",
    jsonLd: breadcrumbJsonLd([["خانه", "/"], ["مجله", "/blog/"]]),
    body: `<h1>مجله ${esc(BRAND.name)}: راهنمای نگهداری سگ و گربه</h1><ul>${SEO.articles.map((a) => `<li><a href="/blog/${a.slug}/">${esc(a.title)}</a> — ${esc(a.description)}</li>`).join("")}</ul>`,
  },
  { priority: "0.7", changefreq: "weekly" },
);
for (const a of SEO.articles) {
  const path = `/blog/${a.slug}/`;
  const trail = [["خانه", "/"], ["مجله", "/blog/"], [a.title, path]];
  const cs = catSlug(a.relatedCategory);
  await emit(
    path,
    {
      title: a.title,
      description: a.description,
      image: "/brand/europet-banner.webp",
      jsonLd: [articleJsonLd(a, path), breadcrumbJsonLd(trail), faqJsonLd(a.faq)],
      body: `${crumbs(trail)}<article><h1>${esc(a.h1)}</h1><p>${esc(a.author)} — ${esc(a.date)}</p>${a.sections.map((s) => `<h2>${esc(s.h2)}</h2>${paras(s.body)}`).join("")}${
        cs ? `<p>محصولات مرتبط: <a href="/category/${cs}/">${esc(a.relatedCategory)}</a></p>` : ""
      }${faqHtml(a.faq)}</article>`,
    },
    { priority: "0.7", lastmod: a.date },
  );
}

// محصولات
for (const p of products) {
  const path = pUrl(p);
  const img = (p.images || [])[0];
  const image = img && img.startsWith("/") ? img : undefined;
  const cs = catSlug(p.category);
  const trail = [["خانه", "/"], ["فروشگاه", "/shop/"], [p.category, cs ? `/category/${cs}/` : "/shop/"], [p.name, path]];
  await emit(
    path,
    {
      title: p.name,
      description: `خرید ${p.name} اصل از پت شاپ موچولو. ${p.desc}`.slice(0, 160),
      image,
      jsonLd: [productJsonLd(p, image), breadcrumbJsonLd(trail)],
      body: `${crumbs(trail)}<h1>${esc(p.name)}</h1>${image ? `<img src="${image}" alt="${esc(p.name)}" width="420">` : ""}<p>${esc(p.desc)}</p><ul>${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>${
        Number(p.price) > 0 ? `<p>قیمت: ${Number(p.price).toLocaleString("fa-IR")} تومان</p>` : "<p>برای استعلام قیمت با ۰۹۱۹۱۰۰۱۹۴۷ تماس بگیرید.</p>"
      }<p>برند: ${esc(p.brand || "-")} — مناسب: ${esc(p.pet)}</p>`,
    },
    { priority: "0.8", images: (p.images || []).filter((x) => x.startsWith("/")), title: p.name },
  );
}

// صفحات ثابت (محتوای اصلی را React می‌سازد؛ اینجا عنوان و توضیحات درست برای خزنده)
for (const [path, title, description] of [
  ["/about/", "درباره پت شاپ موچولو", "داستان پت شاپ موچولو؛ فروشگاه آنلاین و ۴ شعبه حضوری در تجریش، تهرانپارس، مهرشهر و فردیس برای غذا و لوازم اصل سگ و گربه."],
  ["/contact/", "تماس با پت شاپ موچولو", "شماره تماس، اینستاگرام و آدرس شعبه‌های پت شاپ موچولو در تهران و کرج."],
  ["/faq/", "سؤالات متداول خرید", "پاسخ سؤالات رایج درباره ارسال، پرداخت، اصالت کالا و مرجوعی در پت شاپ موچولو."],
  ["/terms/", "قوانین و شرایط خرید", "قوانین خرید، ارسال، پرداخت و مرجوعی کالا در پت شاپ موچولو."],
  ["/privacy/", "حریم خصوصی", "سیاست حفظ حریم خصوصی کاربران پت شاپ موچولو."],
]) {
  await emit(path, { title, description, body: `<h1>${esc(title)}</h1><p>${esc(description)}</p>${branchList}` }, { priority: "0.4" });
}

// نقشه سایت با تصاویر محصولات
const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE_URL}${u.path}</loc><lastmod>${u.lastmod || today}</lastmod>${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}<priority>${u.priority || "0.5"}</priority>${(u.images || [])
        .map((i) => `<image:image><image:loc>${SITE_URL}${i}</image:loc><image:title>${esc(u.title)}</image:title></image:image>`)
        .join("")}</url>`,
  )
  .join("\n")}
</urlset>
`;
await writeFile(join(DIST, "sitemap.xml"), xml);
console.log(`prerender: ${urls.length} صفحه کامل + sitemap ساخته شد`);
