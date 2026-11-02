import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "./firebase.config.json";

// کلید وب Firebase ذاتاً عمومی است؛ امنیت با firestore.rules تأمین می‌شود
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
