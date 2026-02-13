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
      "google.com"
    ]
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 5000,
      launchAutoHide: false,
      backgroundColor: '#bc0e0eff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      launchFadeOutDuration: 500,
    },
    SocialLogin: {
      google: {
        webClientId: '583417452577-elkimar69os44l6qgagqek2arurgmtbc.apps.googleusercontent.com',
      },
    },
  },
};

export default config;
