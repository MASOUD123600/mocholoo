// قالب ساده متن مقاله‌ها: پاراگراف با خط خالی، فهرست با «- »، مراحل با «1. »، لینک داخلی [متن](/path/)
// هم صفحه React و هم prerender از همین تجزیه استفاده می‌کنند تا خروجی یکی باشد

export function blocks(text) {
  const out = [];
  for (const line of String(text || "").split("\n")) {
    const l = line.trim();
    if (!l) {
      out.push(null);
      continue;
    }
    const bullet = l.match(/^[-•]\s+(.*)$/);
    const num = l.match(/^[0-9۰-۹]+[.)-]\s+(.*)$/);
    const type = bullet ? "ul" : num ? "ol" : "p";
    const content = bullet ? bullet[1] : num ? num[1] : l;
    const last = out[out.length - 1];
    if (type !== "p" && last && last.type === type) last.items.push(content);
    else out.push(type === "p" ? { type, text: content } : { type, items: [content] });
  }
  return out.filter(Boolean);
}

// تکه‌های یک خط: متن ساده یا لینک
export function inline(text) {
  const parts = [];
  const re = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[1], href: m[2] });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

// متن بدون نشانه لینک (برای توضیحات و اسکیما)
export const plain = (text) => String(text || "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

export const TOPICS = {
  dog: { name: "سگ", icon: "🐶", label: "راهنمای سگ" },
  cat: { name: "گربه", icon: "🐱", label: "راهنمای گربه" },
  bird: { name: "پرندگان", icon: "🦜", label: "راهنمای پرندگان" },
  "small-pets": { name: "حیوانات کوچک", icon: "🐹", label: "همستر، خرگوش و ..." },
};

export const CLUSTERS = {
  training: "آموزش و رفتار",
  feeding: "تغذیه",
  health: "سلامت و واکسن",
  care: "نگهداری و مراقبت",
  buying: "خرید و نژادها",
  products: "راهنمای خرید محصولات",
};
