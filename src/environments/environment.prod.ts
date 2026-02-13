export const environment = {
  production: true,
  apiUrl: 'https://netflix-automation.fly.dev',
  // apiUrl: 'https://03f6-165-210-39-185.ngrok-free.app',
  firebaseConfig: {
    apiKey: "AIzaSyDib0xP1_YnK6Ct4PpW0cGge3eN-iSHFYw",
    authDomain: "mobilpay-c1872.firebaseapp.com",
    projectId: "mobilpay-c1872",
    storageBucket: "mobilpay-c1872.firebasestorage.app",
    messagingSenderId: "583417452577",
    appId: "1:583417452577:web:e88f72c8082ab7ce04ab60",
    measurementId: "G-MKWE460RDH"
  },
  googleClientId: '583417452577-elkimar69os44l6qgagqek2arurgmtbc.apps.googleusercontent.com',

  // Configuration des plans Netflix (modifiable facilement)
  plans: {
    mobile: {
      name: 'Mobile',
      price: 2500,
      currency: 'XAF',
      resolution: '480p'
    },
    basic: {
      name: 'Basic',
      price: 3000,
      currency: 'XAF',
      resolution: '720p HD'
    },
    standard: {
      name: 'Standard',
      price: 5500,
      currency: 'XAF',
      resolution: '1080p Full HD'
    },
    premium: {
      name: 'Premium',
      price: 25,
      currency: 'XAF',
      resolution: '4K Ultra HD'
    }
  },

  // Préfixe téléphonique par défaut
  defaultPhonePrefix: '+237'
};
