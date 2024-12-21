import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { AppModule } from './app/app.module';




// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKe6rVbJPFP-eF3AcmfX8RKXjUJDToyks",
  authDomain: "mobilpay-2fb8a.firebaseapp.com",
  projectId: "mobilpay-2fb8a",
  storageBucket: "mobilpay-2fb8a.appspot.com",
  messagingSenderId: "861006997372",
  appId: "1:861006997372:web:6f5a98d0cfbcbf706566f9",
  measurementId: "G-1C97EPK88K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
