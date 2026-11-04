import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { ExternalLink, PackagePlus, RefreshCw, Save, Search } from "lucide-react";
import { db } from "../firebase";
import { useApp } from "../store/AppContext";
import { Spinner } from "../components/ui";
import MARKET from "../data/marketData.json";
import { fmtNum, toFa } from "../lib/utils";

// اطلاعات تأمین‌کننده خصوصی است: در private/suppliers (فقط مدیر می‌خواند/می‌نویسد)، نه در سند محصول که عمومی است
const SUP_DOC = doc(db, "private", "suppliers");

async function commitInChunks(items, apply) {
  for (let i = 0; i < items.length; i += 400) {
    const batch = writeBatch(db);
    items.slice(i, i + 400).forEach((x) => apply(batch, x));
    await batch.commit();
  }
}

// تأمین‌کننده‌های بازار را به سند خصوصی اضافه می‌کند؛ شماره و یادداشتی که مدیر وارد کرده دست نمی‌خورد
async function saveSuppliers(saved, ids) {
  const map = {};
  ids.forEach((id) => {
    const m = MARKET.suppliers[id];
    if (m) map[id] = { ...m, ...(saved[id] || {}), marketPrice: m.marketPrice, checkedAt: m.checkedAt, url: m.url, seller: saved[id]?.sellerEdited ? saved[id].seller : m.seller };
  });
  await setDoc(SUP_DOC, { map, updatedAt: serverTimestamp() }, { merge: true });
}

function SupplierRow({ p, s, onSave }) {
  const [f, setF] = useState({ seller: s?.seller || "", phone: s?.phone || "", buyPrice: s?.buyPrice || "", note: s?.note || "" });
  const dirty = ["seller", "phone", "buyPrice", "note"].some((k) => String(f[k] || "") !== String(s?.[k] || ""));
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const margin = Number(p.price) > 0 && Number(f.buyPrice) > 0 ? Math.round(((p.price - f.buyPrice) / f.buyPrice) * 100) : null;
  return (
    <tr className={dirty ? "dirty" : ""}>
      <td><b>{p.name}</b><div className="muted small">قیمت سایت: {Number(p.price) > 0 ? fmtNum(p.price) : "—"}{s?.marketPrice ? ` • بازار: ${fmtNum(s.marketPrice)}` : ""}</div></td>
      <td>
        <input className="cell-input wide" value={f.seller} onChange={set("seller")} placeholder="نام فروشنده/شرکت" />
        <div className="tiny row-gap">
          {s?.url && <a href={s.url} target="_blank" rel="noopener noreferrer">{s.source || "منبع"} <ExternalLink size={11} /></a>}
          {s?.sellerUrl && <a href={s.sellerUrl} target="_blank" rel="noopener noreferrer">صفحه فروشنده <ExternalLink size={11} /></a>}
          {s?.match === "similar" && <span className="muted">(کالای مشابه)</span>}
        </div>
        {s?.alt?.map((a, i) => (
          <div key={i} className="tiny muted">جایگزین: <a href={a.url} target="_blank" rel="noopener noreferrer">{a.source} — {a.seller}</a> {fmtNum(a.price)} ت</div>
        ))}
      </td>
      <td><input className="cell-input" dir="ltr" inputMode="tel" value={f.phone} onChange={set("phone")} placeholder="09..." /></td>
      <td>
        <input className="cell-input" inputMode="numeric" value={f.buyPrice} onChange={set("buyPrice")} placeholder="قیمت خرید" />
        {margin !== null && <div className={`tiny ${margin < 0 ? "bad" : "good"}`}>سود {toFa(margin)}٪</div>}
      </td>
      <td><input className="cell-input wide" value={f.note} onChange={set("note")} placeholder="یادداشت" /></td>
      <td>{dirty && <button className="btn btn-p btn-sm" onClick={() => onSave(p.id, f)}><Save size={14} /></button>}</td>
    </tr>
  );
}

export default function Market() {
  const { products, notify } = useApp();
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => onSnapshot(SUP_DOC, (s) => setSaved(s.data()?.map || {}), () => setSaved({})), []);

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const pending = MARKET.updates.filter((u) => byId[u.id] && Number(byId[u.id].price) !== u.price);
  const missing = MARKET.newProducts.filter((p) => !byId[p.id]);
  const rows = products.filter((p) => !q || `${p.name} ${p.brand} ${saved?.[p.id]?.seller || ""}`.includes(q));

  const applyPrices = async () => {
    if (!window.confirm(`قیمت ${toFa(pending.length)} محصول با قیمت بازار (دیجی‌کالا) به‌روز شود؟`)) return;
    setBusy("prices");
    try {
      await commitInChunks(pending, (b, u) =>
        b.update(doc(db, "products", u.id), { price: u.price, comparePrice: u.comparePrice, ...(u.name && { name: u.name }), updatedAt: serverTimestamp() }),
      );
      await saveSuppliers(saved, pending.map((u) => u.id));
      notify(`قیمت ${toFa(pending.length)} محصول به‌روز شد ✅`);
    } catch (e) {
      console.error(e);
      notify("به‌روزرسانی قیمت‌ها ناموفق بود", "err");
    }
    setBusy("");
  };

  const addNew = async () => {
    if (!window.confirm(`${toFa(missing.length)} محصول جدید با قیمت بازار به فروشگاه اضافه شود؟`)) return;
    setBusy("new");
    try {
      await commitInChunks(missing, (b, p) => b.set(doc(db, "products", p.id), { ...p, createdAt: serverTimestamp() }));
      await saveSuppliers(saved, missing.map((p) => p.id));
      notify(`${toFa(missing.length)} محصول جدید اضافه شد 🎉`);
    } catch (e) {
      console.error(e);
      notify("افزودن محصولات ناموفق بود", "err");
    }
    setBusy("");
  };

  const saveRow = async (id, f) => {
    try {
      await setDoc(SUP_DOC, { map: { [id]: { ...(saved[id] || MARKET.suppliers[id] || {}), ...f, buyPrice: Number(String(f.buyPrice).replace(/\D/g, "")) || "", sellerEdited: true } } }, { merge: true });
      notify("اطلاعات تأمین‌کننده ذخیره شد");
    } catch {
      notify("ذخیره ناموفق بود", "err");
    }
  };

  if (!saved) return <div className="center-load"><Spinner /></div>;
  return (
    <div className="stack">
      <div className="card soft">
        <h3 className="card-title">📊 قیمت بازار <small>(بررسی‌شده در {new Date(MARKET.checkedAt).toLocaleDateString("fa-IR")})</small></h3>
        <p className="muted small">قیمت‌ها همان قیمت فروش دیجی‌کالا در روز بررسی است. «کالای مشابه» یعنی دقیقاً همان مدل پیدا نشد و قیمت نزدیک‌ترین کالای هم‌نوع آمده؛ آن‌ها را یک بار چک کنید.</p>
        <div className="row-gap wrap">
          <button className="btn btn-p" onClick={applyPrices} disabled={!!busy || !pending.length}>
            {busy === "prices" ? <Spinner /> : <><RefreshCw size={16} /> اعمال قیمت بازار روی {toFa(pending.length)} محصول فعلی</>}
          </button>
          <button className="btn btn-p" onClick={addNew} disabled={!!busy || !missing.length}>
            {busy === "new" ? <Spinner /> : <><PackagePlus size={16} /> افزودن {toFa(missing.length)} محصول جدید</>}
          </button>
        </div>
        {pending.length > 0 && (
          <details>
            <summary className="link-btn">مشاهده تغییر قیمت‌ها</summary>
            {pending.map((u) => (
              <div key={u.id} className="row-between small">
                <span>{byId[u.id].name}{MARKET.suppliers[u.id]?.match === "similar" && <span className="muted"> (مشابه)</span>}</span>
                <span dir="ltr">{fmtNum(byId[u.id].price || 0)} → <b>{fmtNum(u.price)}</b></span>
              </div>
            ))}
          </details>
        )}
      </div>

      <div className="card table-card">
        <div className="row-between wrap" style={{ padding: "12px 14px" }}>
          <h3 className="card-title">🏭 تأمین‌کننده هر محصول <small>(فقط شما می‌بینید)</small></h3>
          <label className="search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی محصول یا فروشنده" /></label>
        </div>
        <table className="table">
          <thead><tr><th>محصول</th><th>تأمین‌کننده / منبع</th><th>تلفن</th><th>قیمت خرید</th><th>یادداشت</th><th></th></tr></thead>
          <tbody>
            {rows.map((p) => <SupplierRow key={p.id} p={p} s={saved[p.id] || MARKET.suppliers[p.id]} onSave={saveRow} />)}
          </tbody>
        </table>
      </div>
      <p className="muted small">💡 دیجی‌کالا و باسلام شماره فروشنده را نمایش نمی‌دهند؛ از «صفحه فروشنده» یا چت باسلام با او تماس بگیرید و شماره و قیمت عمده را اینجا ثبت کنید. با وارد کردن «قیمت خرید»، درصد سود هر محصول را می‌بینید.</p>
    </div>
  );
}
