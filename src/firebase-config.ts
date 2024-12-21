// firebase-config.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKe6rVbJPFP-eF3AcmfX8RKXjUJDToyks",
  authDomain: "mobilpay-2fb8a.firebaseapp.com",
  projectId: "mobilpay-2fb8a",
  storageBucket: "mobilpay-2fb8a.appspot.com",
  messagingSenderId: "861006997372",
  appId: "1:861006997372:web:6f5a98d0cfbcbf706566f9",
  measurementId: "G-1C97EPK88K"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exporter l'instance de l'application
export { app }; // Utilisez une exportation nommée
