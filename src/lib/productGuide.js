// بخش راهنمای صفحه محصول: هم React و هم prerender از همین داده استفاده می‌کنند تا متن هر دو یکی باشد

const fa2en = (s) => String(s).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace("٫", ".");

// وزن را فقط از داخل پرانتز نام محصول می‌خواند؛ مثل «(۱٫۵ کیلوگرم)»
export function productWeightKg(name = "") {
  const m = String(name).match(/\(([۰-۹0-9٫.]+)\s*(کیلوگرم|کیلو|گرم)\)/);
  if (!m) return 0;
  const n = Number(fa2en(m[1]));
  if (!n) return 0;
  return m[2] === "گرم" ? n / 1000 : n;
}

// قیمت هر کیلو برای بسته‌های یک کیلویی و بزرگ‌تر
export function pricePerKg(p) {
  const kg = productWeightKg(p?.name);
  const price = Number(p?.price);
  if (kg < 1 || !(price > 0)) return 0;
  return Math.round(price / kg / 1000) * 1000;
}

// عنوان صفحه: اگر جا شد، عبارت پرجست‌وجوی «قیمت و خرید» هم می‌آید
export function productTitle(p) {
  return Number(p?.price) > 0 && String(p?.name || "").length <= 45 ? `قیمت و خرید ${p.name}` : p?.name;
}

const isCat = (p) => p.pet === "گربه";
const isDog = (p) => p.pet === "سگ";

const GUIDES = {
  "غذای خشک": (p) => ({
    tips: [
      `مطمئن شوید این غذا با سن و جثه ${isCat(p) ? "گربه" : isDog(p) ? "سگ" : "حیوان"} شما هماهنگ است و روی بسته «کامل و متعادل» معرفی شده باشد.`,
      "اگر غذا را عوض می‌کنید، طی حدود ۷ تا ۱۰ روز کم‌کم با غذای قبلی مخلوط کنید.",
      "مقدار روزانه را از جدول روی بسته بردارید و درِ بسته را بعد از هر بار مصرف محکم ببندید.",
    ],
    slugs: isCat(p)
      ? ["best-dry-cat-food", "how-to-feed-cat", "dollar-pet-food-price"]
      : ["best-dry-dog-food", "how-to-feed-dog", "how-many-meals-for-dog", "dollar-pet-food-price"],
  }),
  "غذای مرطوب": (p) => ({
    tips: [
      "مقدار غذای مرطوب را با وعده خشک هماهنگ کنید تا کالری روزانه زیاد نشود.",
      "باقی‌مانده کنسرو یا پوچ را دربسته در یخچال بگذارید و طبق راهنمای بسته زود مصرف کنید.",
      "غذایی را که مدت زیادی بیرون مانده است به حیوان ندهید.",
    ],
    slugs: isCat(p) ? ["dry-vs-wet-cat-food", "cat-water-drinking", "how-to-feed-cat"] : ["how-to-feed-dog", "chicken-meat-for-dog-cat"],
  }),
  "تشویقی و اسنک": (p) => ({
    tips: [
      "تشویقی بهتر است بیشتر از حدود ۱۰ درصد کالری روزانه حیوان نشود.",
      "اندازه تکه را متناسب با جثه انتخاب کنید و هنگام خوردن کنار حیوان باشید.",
      "در آموزش، تشویقی را درست بعد از رفتار خوب بدهید.",
    ],
    slugs: isCat(p) ? ["how-to-tame-cat", "how-to-play-with-cat", "cat-obesity"] : ["how-to-train-dog", "dog-basic-commands", "puppy-training-guide"],
  }),
  "مکمل و ویتامین": (p) => ({
    tips: [
      "مکمل جای غذای کامل یا درمان را نمی‌گیرد؛ برای حیوان بیمار یا تحت درمان پیش از مصرف با دامپزشک مشورت کنید.",
      "مقدار مصرف را فقط طبق راهنمای محصول رعایت کنید و چند مکمل هم‌ترکیب را همزمان ندهید.",
      "مکمل انسانی را به جای این محصول به حیوان ندهید.",
    ],
    slugs: isCat(p) ? ["does-cat-need-multivitamin", "cat-hairball", "dog-cat-vitamins"] : ["dog-cat-vitamins", "how-to-feed-dog", "dog-illness-signs"],
  }),
  "شیرخشک": () => ({
    tips: [
      "شیر گاو را جایگزین شیرخشک مخصوص نکنید؛ معمولاً برای بچه حیوان مناسب نیست.",
      "شیر را طبق دستور بسته آماده کنید و باقی‌مانده را نگه ندارید.",
      "بچه حیوان بی‌حال یا بی‌اشتها را زود نزد دامپزشک ببرید.",
    ],
    slugs: ["kitten-milk-feeding-guide", "kitten-care-guide", "kitten-food-guide"],
  }),
  "اسباب‌بازی": (p) => ({
    tips: [
      "اسباب‌بازی را متناسب با جثه و قدرت جویدن انتخاب کنید و قطعات ریز جداشده را دور بیندازید.",
      "نخ و قطعات کوچک را بعد از بازی جمع کنید، چون خطر بلعیدن دارند.",
      "بازی کوتاه و روزانه بیشتر از نگه داشتن اسباب‌بازی زیاد اثر دارد.",
    ],
    slugs: isDog(p) ? ["dog-separation-anxiety", "dog-socialization", "stop-dog-biting"] : ["how-to-play-with-cat", "cat-obesity", "cat-behavior-meanings"],
  }),
  "لباس و پوشاک": () => ({
    tips: [
      "دور سینه و طول پشت را اندازه بگیرید تا لباس تنگ یا مزاحم راه رفتن نباشد.",
      "لباس خیس را زود عوض کنید و پوست زیر آن را برای زخم بررسی کنید.",
      "بیشتر سگ‌های پرمو در هوای معمولی نیازی به لباس ندارند.",
    ],
    slugs: ["pets-cold-weather", "dog-breeds-apartment", "dog-essentials-checklist"],
  }),
  "بهداشت و نظافت": (p) => ({
    tips: [
      "پیش از مصرف، راهنمای بسته و مناسب بودن محصول برای سگ یا گربه را بررسی کنید.",
      "محصول را از چشم، گوش و زخم دور نگه دارید و در صورت حساسیت استفاده را قطع کنید.",
      "برای خارش یا ریزش مو ادامه‌دار به دامپزشک مراجعه کنید.",
    ],
    slugs: isCat(p) ? ["cat-litter-training", "cat-grooming-bathing"] : isDog(p) ? ["dog-bathing-grooming", "dog-potty-training"] : ["cat-grooming-bathing", "dog-bathing-grooming"],
  }),
  "لوازم و تجهیزات": (p) => ({
    tips: [
      "پیش از خرید، اندازه را با جثه فعلی و بزرگسالی حیوان مقایسه کنید.",
      "به جنس محصول و تمیز شدن آسان آن توجه کنید.",
      "وسیله آسیب‌دیده را زود عوض کنید تا لبه تیز یا قطعه جداشده خطر ایجاد نکند.",
    ],
    slugs: isCat(p) ? ["cat-new-home", "cat-litter-training", "buying-a-cat-guide"] : ["dog-essentials-checklist", "pet-travel-tips", "buying-a-dog-guide"],
  }),
};

export function productGuide(p) {
  const g = GUIDES[p?.category]?.(p);
  return { tips: g?.tips || [], slugs: g?.slugs || [], perKg: pricePerKg(p) };
}
