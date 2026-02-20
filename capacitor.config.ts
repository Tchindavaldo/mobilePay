import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moobilpay.app',
  appName: 'MoobilPay',
  webDir: 'www',
  bundledWebRuntime: false,

  server: {
    androidScheme: 'https',
    allowNavigation: [
      "10.0.2.2",
      "google.com",
      "*.firebaseapp.com",
      "*.googleapis.com"
    ]
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#F8F9FA',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      launchFadeOutDuration: 500,
      useDialog: false,
    },
    SocialLogin: {
      google: {
        webClientId: '583417452577-elkimar69os44l6qgagqek2arurgmtbc.apps.googleusercontent.com',
        iOSClientId: '583417452577-1edun3m83ttsldhsaa2gvesmdj6fg2mt.apps.googleusercontent.com',
      },
    },
  },
};

export default config;
