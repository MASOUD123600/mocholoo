import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Spinner } from "../components/ui";
import INDEX from "../data/contentIndex.json";
import { callFn } from "./actions";
import { toFa } from "../lib/utils";

const DAY = 86400000;
const tehranDay = (ms) => new Date(ms + 3.5 * 3600e3).toISOString().slice(0, 10);
const SOURCE_NAMES = { google: "گوگل", bing: "سایر موتورهای جستجو", instagram: "اینستاگرام", telegram: "تلگرام", bale: "بله", ai: "هوش مصنوعی (ChatGPT و ...)", direct: "مستقیم / ذخیره‌شده", other: "سایت‌های دیگر" };

function MiniBars({ data, label }) {
  const max = Math.max(1, ...data.map((d) => d.v));
  return (
    <div className="bars" role="img" aria-label={label}>
      {data.map((d, i) => (
        <div key={d.day} className="bar-col" title={`${new Date(d.day).toLocaleDateString("fa-IR")}: ${toFa(d.v)}`}>
          <motion.div className="bar" initial={{ height: 0 }} animate={{ height: `${(d.v / max) * 100}%` }} transition={{ delay: i * 0.015, type: "spring", damping: 18 }} />
          <small>{i % 3 === 0 ? new Date(d.day).toLocaleDateString("fa-IR", { day: "numeric" }) : ""}</small>
        </div>
      ))}
    </div>
  );
}

function Ranking({ title, rows, empty }) {
  const max = Math.max(1, ...rows.map((r) => r.v));
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      {rows.length ? (
        rows.map((r, i) => (
          <div key={i} className="rank-row">
            <div className="row-between"><span>{toFa(i + 1)}. {r.name}</span><b>{toFa(r.v)}</b></div>
            <div className="rank-bar"><span style={{ width: `${(r.v / max) * 100}%` }} /></div>
          </div>
        ))
      ) : (
        <p className="muted">{empty}</p>
      )}
    </div>
  );
}

export default function Stats() {
  const { products } = useApp();
  const [range, setRange] = useState(30);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setData(null);
    callFn("stats", { days: range }).then(setData, (e) => setErr(e.message));
  }, [range]);

  const s = useMemo(() => {
    if (!data) return null;
    const byDay = Object.fromEntries(data.days.map((d) => [d.day, d]));
    const today = tehranDay(Date.now());
    const series = Array.from({ length: range }, (_, k) => tehranDay(Date.now() - (range - 1 - k) * DAY));
    const sum = (field, list = data.days) => list.reduce((a, d) => a + Number(d[field] || 0), 0);
    const merge = (field) => {
      const m = {};
      data.days.forEach((d) => Object.entries(d[field] || {}).forEach(([k, v]) => (m[k] = (m[k] || 0) + v)));
      return m;
    };
    const pages = merge("pages");
    const bySlug = Object.fromEntries(products.map((p) => [p.slug || p.id, p.name]));
    const productRows = Object.entries(pages)
      .filter(([k]) => k.startsWith("/p/"))
      .map(([k, v]) => ({ name: bySlug[k.split("/")[2]] || k, v }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 10);
    const title = (k) => {
      const [, kind, slug] = k.split("/");
      if (k === "/") return "صفحه اصلی";
      if (kind === "blog" && slug) return INDEX.articles.find((a) => a.slug === slug)?.title || k;
      if (kind === "guide") return INDEX.guides.find((g) => g.topic === slug)?.h1 || k;
      return k;
    };
    const pageRows = Object.entries(pages)
      .filter(([k]) => !k.startsWith("/p/"))
      .map(([k, v]) => ({ name: title(k), v }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 10);
    const signupSince = (ms) => data.signups.filter((t) => t && t >= ms).length;
    return {
      todayVisitors: byDay[today]?.visitors || 0,
      todayViews: byDay[today]?.views || 0,
      visitors: sum("visitors"),
      views: sum("views"),
      visitorSeries: series.map((day) => ({ day, v: byDay[day]?.visitors || 0 })),
      signupSeries: series.map((day) => ({ day, v: data.signups.filter((t) => t && tehranDay(t) === day).length })),
      signupsRange: signupSince(Date.now() - range * DAY),
      productRows,
      pageRows,
      sources: Object.entries(merge("sources")).map(([k, v]) => ({ name: SOURCE_NAMES[k] || k, v })).sort((a, b) => b.v - a.v),
      devices: merge("devices"),
    };
  }, [data, products, range]);

  if (err) return <div className="alert alert-err">بارگذاری آمار ممکن نشد: {err}</div>;
  if (!s) return <div className="center-load"><Spinner /></div>;
  const mob = s.devices.mobile || 0;
  const devTotal = mob + (s.devices.desktop || 0);

  return (
    <div className="stack">
      <div className="chips">
        {[7, 30, 90].map((n) => <button key={n} className={`chip ${range === n ? "on" : ""}`} onClick={() => setRange(n)}>{toFa(n)} روز اخیر</button>)}
      </div>
      <div className="kpis">
        {[
          ["بازدیدکننده امروز", s.todayVisitors, "👀"],
          [`بازدیدکننده ${toFa(range)} روز`, s.visitors, "👥"],
          [`صفحه‌های دیده‌شده ${toFa(range)} روز`, s.views, "📄"],
          ["کل اعضای ثبت‌نام‌کرده", data.totalUsers, "🙋"],
        ].map(([t, v, e], i) => (
          <motion.div key={t} className="kpi" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <span className="kpi-icon">{e}</span>
            <small>{t}</small>
            <b>{toFa(v)}</b>
          </motion.div>
        ))}
      </div>
      <div className="admin-grid">
        <div className="card">
          <h3 className="card-title">بازدیدکننده روزانه <small>(امروز {toFa(s.todayViews)} صفحه دیده شده)</small></h3>
          <MiniBars data={s.visitorSeries} label="بازدیدکننده روزانه" />
        </div>
        <div className="card">
          <h3 className="card-title">ثبت‌نام روزانه <small>({toFa(s.signupsRange)} نفر در {toFa(range)} روز)</small></h3>
          <MiniBars data={s.signupSeries} label="ثبت‌نام روزانه" />
        </div>
      </div>
      <div className="admin-grid">
        <Ranking title="🛍️ پربازدیدترین محصولات" rows={s.productRows} empty="هنوز بازدید محصولی ثبت نشده." />
        <Ranking title="📖 پربازدیدترین صفحه‌ها و مقاله‌ها" rows={s.pageRows} empty="هنوز بازدیدی ثبت نشده." />
      </div>
      <div className="admin-grid">
        <Ranking title="🔗 بازدیدکننده‌ها از کجا آمده‌اند" rows={s.sources} empty="هنوز داده‌ای نیست." />
        <div className="card">
          <h3 className="card-title">📱 دستگاه</h3>
          {devTotal ? (
            <>
              <div className="row-between"><span>موبایل</span><b>{toFa(Math.round((mob / devTotal) * 100))}٪</b></div>
              <div className="row-between"><span>کامپیوتر</span><b>{toFa(100 - Math.round((mob / devTotal) * 100))}٪</b></div>
            </>
          ) : <p className="muted">هنوز داده‌ای نیست.</p>}
          <hr />
          <p className="muted small">کلمه‌هایی که مردم در گوگل جستجو کرده‌اند و به سایت رسیده‌اند، در Search Console دیده می‌شود:</p>
          <a className="btn btn-ghost btn-block" href="https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain:mocholoo.ir" target="_blank" rel="noopener noreferrer">
            کلمات جستجوی گوگل <ExternalLink size={15} />
          </a>
        </div>
      </div>
      <p className="muted small">آمار از ۱۲ آبان ۱۴۰۵ ثبت می‌شود. بازدیدهای خود مدیر و ربات‌ها شمرده نمی‌شوند. «بازدیدکننده» هر دستگاه یک بار در روز حساب می‌شود.</p>
    </div>
  );
}
