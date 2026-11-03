import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from "./firebase.config.json";

// کلید وب Firebase ذاتاً عمومی است؛ امنیت با firestore.rules تأمین می‌شود
export const app = initializeApp(firebaseConfig);

// گوگل سرورهای Firebase را برای آی‌پی ایران می‌بندد (خطای 403)؛
// روی سایت اصلی همه درخواست‌ها از مسیرهای خود سایت عبور می‌کنند و Netlify آن‌ها را به گوگل می‌رساند (netlify.toml)
const host = typeof location !== "undefined" ? location.host : "";
const proxied = /(^|\.)mocholoo\.ir$|\.netlify\.app$/.test(host);

export const auth = getAuth(app);
if (proxied) {
  auth.config.apiHost = `${host}/__id`;
  auth.config.tokenApiHost = `${host}/__tk`;
}

export const db = initializeFirestore(
  app,
  proxied
    ? {
        host: `${host}/__fs`,
        ssl: true,
        // پروکسی Netlify اتصال‌های خیلی طولانی را قطع می‌کند؛ درخواست‌های کوتاه long-polling
        experimentalForceLongPolling: true,
        experimentalLongPollingOptions: { timeoutSeconds: 20 },
      }
    : {},
);
