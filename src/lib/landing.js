// صفحه‌های برند (/brand/<slug>/) و دسته + حیوان (/category/<cat>/<pet>/) — مشترک بین React و prerender (بدون JSX و بدون import JSON)
export const PET_SLUGS = { cat: "گربه", dog: "سگ" };

const norm = (s) => String(s || "").toLowerCase().replace(/[\s‌.'’_-]+/g, "");

// برند محصول را با نام‌های فارسی/لاتین (aliases) پیدا می‌کند
export function brandOf(p, brands) {
  const b = norm(p?.brand);
  if (!b) return null;
  return brands.find((x) => x.aliases.some((a) => norm(a) === b)) || null;
}

export const brandProducts = (products, brand, brands) => products.filter((p) => brandOf(p, brands)?.slug === brand.slug);

export const petCatProducts = (products, catName, petSlug) =>
  products.filter((p) => p.category === catName && (p.pet === PET_SLUGS[petSlug] || p.pet === "سگ و گربه"));

export const petCatPath = (pc) => `/category/${pc.cat}/${pc.pet}/`;
export const brandPath = (b) => `/brand/${b.slug}/`;

// کمترین و بیشترین قیمت (تومان) برای متن خلاصه صفحه
export function priceRange(list) {
  const prices = list.map((p) => Number(p.price)).filter((x) => x > 0);
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices), count: prices.length } : null;
}

// ItemList برای گوگل (فهرست محصولات صفحه)
export const itemListLd = (list, siteUrl, name) =>
  list.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        itemListElement: list.slice(0, 30).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${siteUrl}/p/${p.slug || p.id}/`, name: p.name })),
      }
    : null;
