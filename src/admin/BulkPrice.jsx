import { useState } from "react";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Percent, RotateCcw } from "lucide-react";
import { db } from "../firebase";
import { useApp } from "../store/AppContext";
import { Spinner } from "../components/ui";
import { fmtNum, num, toEn, toFa } from "../lib/utils";

const ROUNDS = [
  [1, "بدون گرد کردن"],
  [100, "گرد به ۱۰۰ تومان"],
  [1000, "گرد به ۱٬۰۰۰ تومان"],
  [10000, "گرد به ۱۰٬۰۰۰ تومان"],
];

// Firestore حداکثر ۵۰۰ تغییر در هر batch قبول می‌کند
async function commitInChunks(rows, build) {
  for (let i = 0; i < rows.length; i += 400) {
    const batch = writeBatch(db);
    rows.slice(i, i + 400).forEach((r) => batch.update(doc(db, "products", r.id), build(r)));
    await batch.commit();
  }
}

// تغییر درصدی قیمت همه محصولات (یا محصولات فیلترشده) با امکان برگرداندن آخرین تغییر
export default function BulkPrice({ list, filtered }) {
  const { products, notify } = useApp();
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState("10");
  const [round, setRound] = useState(1000);
  const [withCompare, setWithCompare] = useState(true);
  const [busy, setBusy] = useState(false);

  const p = Number(toEn(pct).trim().replace(/[−–]/g, "-").replace(/[٫,]/g, ".").replace(/[%٪\s]/g, ""));
  const priced = list.filter((x) => Number(x.price) > 0);
  const calc = (v) => Math.max(round, Math.round((Number(v) * (1 + p / 100)) / round) * round);
  const lastBulk = products.reduce((m, x) => (x.bulkId && x.bulkId > m ? x.bulkId : m), "");
  const lastRows = products.filter((x) => x.bulkId === lastBulk && x.prevPrice > 0);
  const valid = Number.isFinite(p) && p !== 0 && p > -90 && p <= 500;

  const apply = async () => {
    if (!valid || !priced.length) return;
    if (!window.confirm(`قیمت ${toFa(priced.length)} محصول ${p > 0 ? `${toFa(p)}٪ افزایش` : `${toFa(-p)}٪ کاهش`} پیدا کند؟ (بعداً با «برگرداندن» قابل لغو است)`)) return;
    setBusy(true);
    const bulkId = new Date().toISOString();
    try {
      await commitInChunks(priced, (x) => ({
        price: calc(x.price),
        prevPrice: Number(x.price),
        ...(withCompare && Number(x.comparePrice) > 0 && { comparePrice: calc(x.comparePrice), prevCompare: Number(x.comparePrice) }),
        bulkId,
        updatedAt: serverTimestamp(),
      }));
      notify(`قیمت ${toFa(priced.length)} محصول به‌روز شد ✅`);
      setOpen(false);
    } catch (e) {
      console.error(e);
      notify("تغییر قیمت‌ها ناموفق بود؛ دوباره امتحان کن", "err");
    }
    setBusy(false);
  };

  const undo = async () => {
    if (!window.confirm(`آخرین تغییر گروهی (${toFa(lastRows.length)} محصول) برگردانده شود؟`)) return;
    setBusy(true);
    try {
      await commitInChunks(lastRows, (x) => ({
        price: x.prevPrice,
        ...(x.prevCompare > 0 && { comparePrice: x.prevCompare }),
        bulkId: "",
        prevPrice: 0,
        prevCompare: 0,
        updatedAt: serverTimestamp(),
      }));
      notify("قیمت‌ها به حالت قبل برگشت ↩️");
    } catch (e) {
      console.error(e);
      notify("برگرداندن ناموفق بود", "err");
    }
    setBusy(false);
  };

  return (
    <div className="card soft bulk-price">
      <div className="row-between wrap">
        <button className="btn btn-ghost" onClick={() => setOpen((v) => !v)}><Percent size={17} /> تغییر گروهی قیمت (درصدی)</button>
        {lastRows.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={undo} disabled={busy}><RotateCcw size={15} /> برگرداندن آخرین تغییر گروهی ({toFa(lastRows.length)} محصول)</button>
        )}
      </div>
      {open && (
        <div className="stack">
          <div className="bulk-row">
            <label className="field">
              <span>درصد تغییر (منفی = کاهش، مثلاً ۱۰ یا ‎-۵)</span>
              <input dir="ltr" inputMode="decimal" value={pct} onChange={(e) => setPct(e.target.value)} />
            </label>
            <label className="field">
              <span>گرد کردن قیمت جدید</span>
              <select value={round} onChange={(e) => setRound(Number(e.target.value))}>{ROUNDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
          </div>
          <div className="chips">
            {[5, 10, 15, -5, -10].map((v) => <button key={v} className={`chip ${p === v ? "on" : ""}`} onClick={() => setPct(String(v))}>{v > 0 ? "+" : "−"}{toFa(Math.abs(v))}٪</button>)}
          </div>
          <label className="check"><input type="checkbox" checked={withCompare} onChange={(e) => setWithCompare(e.target.checked)} /> قیمت قبل از تخفیف (خط‌خورده) هم به همین نسبت تغییر کند</label>
          <p className="muted small">
            روی <b>{toFa(priced.length)}</b> محصول قیمت‌دار {filtered ? "که الان با جستجو/دسته فیلتر شده‌اند" : "(همه محصولات)"} اعمال می‌شود؛ محصولات بدون قیمت دست نمی‌خورند.
            {filtered && " برای اعمال روی همه، فیلترها را خالی کن."}
          </p>
          {valid && priced.length > 0 && (
            <div className="bulk-preview">
              {priced.slice(0, 4).map((x) => (
                <div key={x.id} className="row-between"><span className="muted small">{x.name}</span><span dir="ltr">{fmtNum(num(x.price))} → <b>{fmtNum(calc(x.price))}</b></span></div>
              ))}
            </div>
          )}
          <button className="btn btn-p" onClick={apply} disabled={busy || !valid || !priced.length}>
            {busy ? <Spinner /> : valid ? `اعمال ${p > 0 ? "+" : "−"}${toFa(Math.abs(p))}٪ روی ${toFa(priced.length)} محصول` : "درصد معتبر وارد کن"}
          </button>
        </div>
      )}
    </div>
  );
}
