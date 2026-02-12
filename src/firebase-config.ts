// firebase-config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from "./environments/environment";

// Initialiser Firebase (avec vérification pour éviter les duplicatas)
const app = getApps().length === 0
  ? initializeApp(environment.firebaseConfig)
  : getApp();

const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Exporter l'instance de l'application
export { app };
