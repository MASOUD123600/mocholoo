// ایمیل مدیر — باید با ایمیل داخل firestore.rules یکی باشد
export const ADMIN_EMAIL = "masood.malek225@gmail.com";
// نام کاربری کوتاه برای ورود ادمین (به ایمیل بالا ترجمه می‌شود)
export const ADMIN_ALIAS = "KENSHIN";

export const SITE_URL = "https://mocholoo.ir";
export const BRAND = {
  name: "موچولو",
  siteName: "پت شاپ موچولو",
  latin: "Mocholoo Pet",
  instagram: "mocholo.pet",
};

export const ORDER_STATUSES = [
  "در انتظار پرداخت",
  "در انتظار تأیید رسید",
  "پرداخت شده",
  "در حال آماده‌سازی",
  "ارسال شده",
  "تحویل داده شد",
  "لغو شده",
];
export const PAID_STATUSES = ["پرداخت شده", "در حال آماده‌سازی", "ارسال شده", "تحویل داده شد"];

// slug هر دسته = آدرس صفحه سئو /category/<slug>
export const CATEGORIES = [
  { name: "غذای خشک", icon: "🥣", slug: "dry-food" },
  { name: "غذای مرطوب", icon: "🥫", slug: "wet-food" },
  { name: "تشویقی و اسنک", icon: "🦴", slug: "treats" },
  { name: "مکمل و ویتامین", icon: "💊", slug: "supplements" },
  { name: "شیرخشک", icon: "🍼", slug: "milk-replacer" },
  { name: "اسباب‌بازی", icon: "🧶", slug: "toys" },
  { name: "لباس و پوشاک", icon: "🧥", slug: "clothes" },
  { name: "بهداشت و نظافت", icon: "🧼", slug: "hygiene" },
  { name: "لوازم و تجهیزات", icon: "🎒", slug: "accessories" },
];
export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const categoryUrl = (name) => {
  const c = CATEGORIES.find((x) => x.name === name);
  return c ? `/category/${c.slug}/` : `/shop?cat=${encodeURIComponent(name)}`;
};
export const PETS = ["گربه", "سگ", "سگ و گربه", "پرنده", "جوندگان"];

// شعبه‌ها — نشانی دقیق هر شعبه را وقتی آماده شد اینجا (یا از پنل) کامل کنید
export const BRANCHES = [
  { slug: "tajrish", name: "تجریش", city: "تهران", region: "شمال تهران", address: "تهران، میدان تجریش", main: true },
  { slug: "tehranpars", name: "تهرانپارس", city: "تهران", region: "شرق تهران", address: "تهران، تهرانپارس، قنات کوثر، بلوار مطهری، نبش کوچه دهم مرکزی، پلاک ۱۰۶ و ۴" },
  { slug: "mehrshahr", name: "مهرشهر", city: "کرج", region: "کرج", address: "کرج، مهرشهر، میدان مهرشهر" },
  { slug: "fardis", name: "فردیس", city: "کرج", region: "کرج", address: "کرج، فردیس، فلکه اول" },
];

export const THEMES = {
  mocholoo: { label: "فیروزه‌ای موچولو", primaryColor: "#118A8C", darkColor: "#0B3D48", accentColor: "#FFB547", hotColor: "#FF7A59", bgColor: "#F4FBFA" },
  berry: { label: "بنفش", primaryColor: "#5B2A86", darkColor: "#24103A", accentColor: "#FFC83D", hotColor: "#FF7A1A", bgColor: "#FAF7FE" },
  sunset: { label: "نارنجی گرم", primaryColor: "#E07B39", darkColor: "#2C1810", accentColor: "#F5C842", hotColor: "#D94F30", bgColor: "#FDF8F3" },
  ocean: { label: "آبی آرام", primaryColor: "#2459A8", darkColor: "#0D1F3C", accentColor: "#FFC83D", hotColor: "#FF6B6B", bgColor: "#F5F8FD" },
};

export const DEFAULT_SETTINGS = {
  siteName: BRAND.siteName,
  tagline: "کوچولوی تو، دنیای ما",
  announcement: "🐾 ۴ شعبه در تجریش، تهرانپارس، مهرشهر و فردیس — ارسال سریع، کالای اصل، مشاوره رایگان",
  heroTitle: "هرچی پشمالوت لازم داره،",
  heroHighlight: "تو موچولو هست",
  heroSubtitle: "غذای خشک و مرطوب، تشویقی، مکمل، شیرخشک، اسباب‌بازی و لوازم اصل سگ و گربه از برندهای معتبر دنیا؛ با مشاوره رایگان و ارسال سریع.",
  heroBtn1: "مشاهده محصولات",
  heroBtn2: "مشاوره رایگان",
  feat1Icon: "🚚", feat1Title: "ارسال سریع", feat1Desc: "تهران و کرج",
  feat2Icon: "✅", feat2Title: "تضمین اصالت", feat2Desc: "فقط کالای اصل و تاریخ‌دار",
  feat3Icon: "💳", feat3Title: "پرداخت امن", feat3Desc: "بله‌پی یا کارت به کارت",
  feat4Icon: "🎁", feat4Title: "دوستتو معرفی کن", feat4Desc: "۱۰٪ تخفیف برای هر دوتون",
  phone: "09191001947",
  phone2: "",
  email: "info@mocholoo.ir",
  address: BRANCHES[0].address,
  instagram: BRAND.instagram,
  telegram: "",
  bale: "",
  mapUrl: "",
  workHours: "",
  footerDesc: "پت شاپ موچولو؛ غذا و لوازم اصل سگ و گربه با مشاوره رایگان، در ۴ شعبه تهران و کرج و فروشگاه آنلاین.",
  freeShippingMin: "0",
  shippingCost: "0",
  referralPercent: "10",
  // پرداخت
  balePayEnabled: false,
  baleBotUsername: "",
  cardPayEnabled: true,
  cardNumber: "",
  cardHolder: "",
  cardBank: "",
  // رنگ‌ها
  ...(({ label, ...colors }) => colors)(THEMES.mocholoo), // eslint-disable-line no-unused-vars
};
