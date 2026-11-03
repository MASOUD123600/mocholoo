// ارسال یک بازدید صفحه به تابع track (بدون کوکی و اطلاعات شخصی)
import { storage } from "./utils";

let first = true;
export function trackView(path) {
  if (navigator.webdriver || /^(localhost|127\.)/.test(location.hostname)) return;
  const today = new Date().toISOString().slice(0, 10);
  const newVisitor = storage.get("mch-seen", "") !== today;
  if (newVisitor) storage.set("mch-seen", today);
  const body = JSON.stringify({
    path,
    newVisitor,
    ref: first ? document.referrer : "",
    ...(newVisitor && { mobile: matchMedia("(max-width: 768px)").matches }),
  });
  first = false;
  try {
    if (!navigator.sendBeacon?.("/.netlify/functions/track", new Blob([body], { type: "application/json" })))
      fetch("/.netlify/functions/track", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    /* آمار نباید سایت را خراب کند */
  }
}
