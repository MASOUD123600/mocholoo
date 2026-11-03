// فقط برای مدیر: بعد از تغییر وضعیت سفارش، به مشتری (اگر با بله‌پی پرداخت کرده) در بله خبر می‌دهد
import { admin, bale, json, verifyAdmin } from "../lib/shared.mjs";

const SITE = process.env.SITE_URL || "https://mocholoo.ir";

const MESSAGES = {
  "پرداخت شده": "✅ پرداخت سفارش شما تأیید شد و به‌زودی آماده‌سازی آن شروع می‌شود.",
  "در حال آماده‌سازی": "📦 سفارش شما در حال آماده‌سازی و بسته‌بندی است.",
  "ارسال شده": "🚚 سفارش شما ارسال شد و به‌زودی به دستتان می‌رسد.",
  "تحویل داده شد": "🎉 سفارش شما تحویل داده شد. ممنون که از موچولو خرید کردید! 🐾",
  "لغو شده": "❌ سفارش شما لغو شد. برای پیگیری با فروشگاه تماس بگیرید.",
};

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method" });
  if (!(await verifyAdmin(event))) return json(401, { error: "فقط مدیر" });
  const { orderId } = JSON.parse(event.body || "{}");
  if (!/^[A-Za-z0-9]{10,40}$/.test(orderId || "")) return json(400, { error: "bad id" });

  const snap = await admin().db.doc(`orders/${orderId}`).get();
  const o = snap.data();
  const text = o && MESSAGES[o.status];
  if (!o?.baleChatId || !text) return json(200, { skipped: true });

  const r = await bale("sendMessage", {
    chat_id: o.baleChatId,
    text: `${text}\n\nکد پیگیری: ${o.trackingCode}\nوضعیت: ${o.status}`,
    reply_markup: { inline_keyboard: [[{ text: "🔎 پیگیری سفارش در سایت", url: `${SITE}/order/${snap.id}` }]] },
  });
  return json(200, { sent: !!r.ok });
};
