export const environment = {
  production: true,
  apiUrl: 'http://98.93.27.18:80',
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
      price: 6500,
      currency: 'XAF',
      resolution: '4K Ultra HD'
    }
  },

  // Préfixe téléphonique par défaut
  defaultPhonePrefix: '+237'
};
