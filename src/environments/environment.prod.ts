export const environment = {
  production: true,
  apiUrl: 'https://netflix-automation.fly.dev',
  // apiUrl: 'http://localhost:3000',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

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
