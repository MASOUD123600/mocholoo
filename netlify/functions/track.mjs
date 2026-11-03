// آمار بازدید ساده و خصوصی: هر بازدید صفحه یک عدد به سند روزانه stats/YYYY-MM-DD اضافه می‌کند
// (بدون کوکی و بدون ذخیره آی‌پی یا اطلاعات شخصی؛ فقط شمارنده)
import { FieldValue, admin, json } from "../lib/shared.mjs";

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless|facebookexternalhit|whatsapp|telegram/i;
const SOURCES = [
  ["google", /google\./],
  ["bing", /bing\.|duckduckgo|yandex/],
  ["instagram", /instagram\.|l\.instagram/],
  ["telegram", /t\.me|telegram/],
  ["bale", /ble\.ir|bale\.ai/],
  ["ai", /chatgpt|openai|perplexity|gemini|claude\.ai|copilot/],
];
const key = (s) => String(s || "").slice(0, 120).replace(/[.#$[\]~*]/g, "_") || "/";

export const handler = async (event) => {
  if (event.httpMethod !== "POST" || BOT.test(event.headers["user-agent"] || "")) return json(200, { ok: true });
  let b;
  try {
    b = JSON.parse(event.body || "{}");
  } catch {
    return json(400, {});
  }
  const path = String(b.path || "");
  if (!path.startsWith("/") || path.startsWith("/admin")) return json(200, { ok: true });

  // روز به وقت تهران
  const day = new Date(Date.now() + 3.5 * 3600e3).toISOString().slice(0, 10);
  const ref = String(b.ref || "");
  const source = ref && !/mocholoo\.ir|netlify\.app/.test(ref) ? SOURCES.find(([, re]) => re.test(ref))?.[0] || "other" : b.newVisitor ? "direct" : "";
  const inc = FieldValue.increment(1);
  const data = { day, views: inc, pages: { [key(path)]: inc } };
  if (b.newVisitor) data.visitors = inc;
  if (source) data.sources = { [source]: inc };
  if (b.mobile !== undefined) data.devices = { [b.mobile ? "mobile" : "desktop"]: inc };

  await admin().db.doc(`stats/${day}`).set(data, { merge: true });
  return json(200, { ok: true });
};
