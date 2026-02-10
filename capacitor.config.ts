import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MoobilPay',
  webDir: 'www',
  bundledWebRuntime: false ,     // Paramètre pour inclure le runtime Web
  
  plugins: {
    SplashScreen: {
      // Chemin vers votre écran de démarrage
      launchShowDuration: 0,
      backgroundColor: '#ffffff', // Couleur de fond de l'écran de démarrage
      androidScaleType: 'CENTER_CROP', // Type d'échelle pour Android
      showSpinner: false, // Affiche un spinner ou pas
      splashFullScreen: true, // Écran complet
      splashImmersive: true, // Immersif
    },
  },
};



export default config;
