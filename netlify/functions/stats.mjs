// فقط برای مدیر: آمار بازدید روزهای اخیر + تعداد ثبت‌نام‌ها
import { admin, json, verifyAdmin } from "../lib/shared.mjs";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method" });
  if (!(await verifyAdmin(event))) return json(401, { error: "فقط مدیر" });
  const { days = 30 } = JSON.parse(event.body || "{}");
  const n = Math.min(Math.max(Number(days) || 30, 1), 365);
  const from = new Date(Date.now() + 3.5 * 3600e3 - (n - 1) * 86400e3).toISOString().slice(0, 10);

  const { db } = admin();
  const snap = await db.collection("stats").where("day", ">=", from).get();
  const users = await db.collection("users").select("createdAt").get();
  const signups = users.docs.map((d) => d.get("createdAt")?.toMillis?.() || null);
  return json(200, { days: snap.docs.map((d) => d.data()), signups, totalUsers: users.size });
};
