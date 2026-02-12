import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moobilpay.app',
  appName: 'MoobilPay',
  webDir: 'www',
  bundledWebRuntime: false,     // Paramètre pour inclure le runtime Web

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '583417452577-elkimar69os44l6qgagqek2arurgmtbc.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};



export default config;
