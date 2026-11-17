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

// شعبه‌ها — نام و نشانی دقیقاً مثل ثبت در نشان (۲۶ آبان ۱۴۰۵)؛ neshan = صفحه همان مکان در نشان
const NESHAN = (id) => `https://neshan.org/maps/places/${id}`;
export const BRANCHES = [
  { slug: "fardis", num: 1, name: "فردیس", city: "کرج", region: "کرج", address: "کرج، فردیس، فلکه اول" },
  { slug: "gohardasht", num: 2, name: "گوهردشت", city: "کرج", region: "کرج", address: "کرج، بلوار آزادی، بین ششم فاز ۱ و پنجم فاز ۲، پلاک ۱۰، فاز دو گوهردشت (رجایی‌شهر)", neshan: NESHAN("1f5d4bf6b0f9bdcbee1c0fda4e5fdffc"), lat: 35.849038, lng: 50.974077 },
  { slug: "punak", num: 3, name: "پونک", city: "تهران", region: "شمال غرب تهران", address: "تهران، بزرگراه اشرفی اصفهانی، کربلایی احمد، بین دوم و اول، مرکز خرید بوستان (پونک شمالی)", neshan: NESHAN("8f7c214c177cda98ef33d48ad0927c1a"), lat: 35.761661, lng: 51.33414 },
  { slug: "saadat-abad", num: 4, name: "سعادت‌آباد", city: "تهران", region: "شمال غرب تهران", address: "تهران، سعادت‌آباد، بین مقدس و کیان، بوستان سنگی (محله دریا)", neshan: NESHAN("894b0025d3a96b9c83c8c4ea7a70c536"), lat: 35.780471, lng: 51.375218 },
  { slug: "tajrish", num: 5, name: "تجریش", city: "تهران", region: "شمال تهران", address: "تهران، خیابان شریعتی، بین ماهروزاده و رفعت (دزاشیب، نزدیک تجریش)", neshan: NESHAN("2157ccd1eb7134995c643d210198b65a"), lat: 35.802528, lng: 51.433999, main: true },
  { slug: "azimieh", num: 6, name: "عظیمیه", city: "کرج", region: "کرج", address: "کرج، بلوار شریعتی، بین رسالت ۱۷ و میدان استقلال، پلاک ۱۴ (عظیمیه)", neshan: NESHAN("d191634a13143ce1b097908bc9243e6b"), lat: 35.834798, lng: 51.018495 },
];
export const MAIN_BRANCH = BRANCHES.find((b) => b.main) || BRANCHES[0];

export const THEMES = {
  mocholoo: { label: "فیروزه‌ای موچولو", primaryColor: "#118A8C", darkColor: "#0B3D48", accentColor: "#FFB547", hotColor: "#FF7A59", bgColor: "#F4FBFA" },
  berry: { label: "بنفش", primaryColor: "#5B2A86", darkColor: "#24103A", accentColor: "#FFC83D", hotColor: "#FF7A1A", bgColor: "#FAF7FE" },
  sunset: { label: "نارنجی گرم", primaryColor: "#E07B39", darkColor: "#2C1810", accentColor: "#F5C842", hotColor: "#D94F30", bgColor: "#FDF8F3" },
  ocean: { label: "آبی آرام", primaryColor: "#2459A8", darkColor: "#0D1F3C", accentColor: "#FFC83D", hotColor: "#FF6B6B", bgColor: "#F5F8FD" },
};

export const DEFAULT_SETTINGS = {
  siteName: BRAND.siteName,
  tagline: "کوچولوی تو، دنیای ما",
  announcement: "🐾 ۶ شعبه در تهران و کرج: تجریش، سعادت‌آباد، پونک، گوهردشت، عظیمیه و فردیس — ارسال سریع، کالای اصل، مشاوره رایگان",
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
  address: MAIN_BRANCH.address,
  instagram: BRAND.instagram,
  telegram: "",
  bale: "",
  mapUrl: MAIN_BRANCH.neshan || "",
  workHours: "",
  footerDesc: "پت شاپ موچولو؛ غذا و لوازم اصل سگ و گربه با مشاوره رایگان، در ۶ شعبه تهران و کرج و فروشگاه آنلاین.",
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
