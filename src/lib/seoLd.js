// داده ساختاریافته Schema.org — هم در صفحات React و هم در prerender زمان بیلد استفاده می‌شود (بدون JSX)
import { BRAND, BRANCHES, SITE_URL } from "../config.js";

export const fullTitle = (title, homeTitle) => (!title ? homeTitle : title.includes(BRAND.name) ? title : `${title} | ${BRAND.name}`);
const intlPhone = (p) => (p ? `+98${String(p).replace(/\D/g, "").replace(/^0/, "")}` : undefined);

export const faqJsonLd = (items = []) =>
  items.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;

export const breadcrumbJsonLd = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE_URL + path })),
});

export const branchLd = (b, phone) => ({
  "@type": "PetStore",
  "@id": `${SITE_URL}/branch/${b.slug}/#store`,
  name: `${BRAND.siteName} شعبه ${b.name}`,
  url: `${SITE_URL}/branch/${b.slug}/`,
  telephone: intlPhone(phone),
  image: `${SITE_URL}/icon-512.png`,
  priceRange: "$$",
  address: { "@type": "PostalAddress", streetAddress: b.address, addressLocality: b.city, addressCountry: "IR" },
  parentOrganization: { "@id": `${SITE_URL}/#org` },
});

export const storeJsonLd = (phone = "09191001947") => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: BRAND.siteName,
      alternateName: [BRAND.name, BRAND.latin, "Mocholoo", "Mocholo Pet", "موچولو پت"],
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: [`https://www.instagram.com/${BRAND.instagram}/`],
      contactPoint: { "@type": "ContactPoint", telephone: intlPhone(phone), contactType: "customer service", areaServed: ["تهران", "کرج"], availableLanguage: "fa" },
    },
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, name: BRAND.siteName, alternateName: BRAND.name, url: `${SITE_URL}/`, inLanguage: "fa-IR", publisher: { "@id": `${SITE_URL}/#org` } },
    ...BRANCHES.map((b) => branchLd(b, phone)),
  ],
});

export const articleJsonLd = (a, path) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: a.title,
  description: a.description,
  datePublished: a.date,
  dateModified: a.date,
  inLanguage: "fa-IR",
  image: `${SITE_URL}/brand/europet-banner.webp`,
  author: { "@type": "Organization", name: a.author || "تیم موچولو", url: `${SITE_URL}/about` },
  publisher: { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: BRAND.siteName, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
  mainEntityOfPage: SITE_URL + path,
});

export const productJsonLd = (p, image) => {
  const priced = Number(p.price) > 0;
  const url = `${SITE_URL}/p/${p.slug || p.id}/`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.desc,
    image: image ? [image.startsWith("http") ? image : SITE_URL + image] : undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    category: p.category,
    sku: p.id,
    url,
    ...(priced && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "IRR",
        price: Number(p.price) * 10,
        availability: Number(p.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": `${SITE_URL}/#org` },
      },
    }),
  };
};
