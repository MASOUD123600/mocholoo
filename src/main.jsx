import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { AppProvider } from "./store/AppContext";
import "./styles.css";

// تگ‌های سئوی ثابت (از prerender) حذف می‌شوند چون از این به بعد React آن‌ها را برای هر صفحه می‌سازد
document.querySelectorAll("head [data-static]").forEach((el) => el.remove());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <AppProvider>
          <App />
        </AppProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
