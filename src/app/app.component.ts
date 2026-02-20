import { Component, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { app } from '../firebase-config';
import { AuthStateService } from './services/auth-state.service';
import { FcmService } from './services/notifications/FCM/fcm.service';
import { Platform, IonRouterOutlet } from '@ionic/angular';
import { UserStorageService } from './services/storage/user-storage.service';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private isNavigating = false;
  private isFirstLoad = true;

  constructor(
    private router: Router,
    private authState: AuthStateService,
    private fcmService: FcmService,
    private platform: Platform,
    private userStorage: UserStorageService,
    @Optional() private routerOutlet?: IonRouterOutlet
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.fcmService.setupPushNotifications();
      this.initializeAuth();
      this.setupBackButtonCustomHandler();
    });
  }

  private setupBackButtonCustomHandler() {
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      const url = this.router.url;
      // Liste des pages qui doivent quitter l'application au lieu de faire "retour"
      const rootPages = [
        '/tabs/tab1',
        '/tabs/tab4',
        '/tabs/activations',
        '/tabs/tab2',
        '/tabs/tab3',
        '/login',
        '/explication',
        '/'
      ];

      if (rootPages.some(page => url === page)) {
        // Sortir de l'application si sur une page racine ou un onglet principal
        App.exitApp();
      } else {
        // Sinon laisser le comportement normal (ex: retour du paiement vers home)
        processNextHandler();
      }
    });
  }

  private async initializeAuth() {
    const auth = getAuth(app);

    // Fix iOS: Appliquer une persistance robuste explicitement
    try {
      await setPersistence(auth, browserLocalPersistence);
      console.log('🧭 [ANGULAR] Firebase Persistence set to browserLocalPersistence');
    } catch (e) {
      console.warn('⚠️ [ANGULAR] Could not set Firebase persistence:', e);
    }

    console.log('🧭 [ANGULAR] Registering onAuthStateChanged listener...');

    // On enregistre le listener IMMÉDIATEMENT
    onAuthStateChanged(auth, async (user) => {
      const currentUrl = this.router.url;
      console.log('🧭 [ANGULAR] !!! onAuthStateChanged fired !!! - User:', !!user, 'URL now:', currentUrl);

      // On récupère "hasSeenOnboarding" au moment du changement d'état
      // pour ne pas bloquer l'enregistrement du listener ci-dessus
      const hasSeenOnboarding = await this.userStorage.get('hasSeenOnboarding') === true ||
        await this.userStorage.get('hasSeenOnboarding') === 'true';

      // Éviter le flash du login si on vient d'une notification
      if (this.isFirstLoad) {
        console.log('🧭 [ANGULAR] First load - waiting for potential notification triggers...');
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (user) {
        if (this.authState.isGoogleLoginActive()) {
          console.log('🧭 [ANGULAR] Google login in progress, skip redirection.');
          if (this.isFirstLoad) {
            this.isFirstLoad = false;
            await SplashScreen.hide();
          }
          return;
        }

        if (currentUrl === '/login' || currentUrl === '/phone-auth' || currentUrl === '/explication' || currentUrl === '/' || currentUrl === '/splash') {
          console.log('🧭 [ANGULAR] User authenticated. Navigating to Home.');
          await this.navigateWithFlag(['/tabs/tab1']);
        }
      } else {
        if (!hasSeenOnboarding) {
          console.log('🧭 [ANGULAR] New user (Onboarding not seen). Navigating to /explication');
          await this.navigateWithFlag(['/explication']);
        } else {
          if (currentUrl === '/' || currentUrl === '/splash' || currentUrl.includes('/tabs/')) {
            console.log('🧭 [ANGULAR] User not authenticated. Navigating to Login.');
            await this.navigateWithFlag(['/login']);
          }
        }
      }
    });

    // SÉCURITÉ : Masquer le splash screen après un délai maximum si l'Auth ne répond pas
    setTimeout(async () => {
      if (this.isFirstLoad) {
        console.error('❌ [ANGULAR] Auth initialization timed out (30s). Force hiding splash.');
        this.isFirstLoad = false;
        await SplashScreen.hide({
          fadeOutDuration: 500
        });
      }
    }, 30000);
  }

  private async navigateWithFlag(route: string[]) {
    this.isNavigating = true;
    try {
      await this.router.navigate(route, { replaceUrl: true });

      // Masquer le splash screen dès que la première navigation réussit
      if (this.isFirstLoad) {
        this.isFirstLoad = false;
        console.log('✨ [ANGULAR] First navigation complete. Hiding Splash Screen...');
        // Petit délai pour laisser le temps au DOM de se stabiliser
        setTimeout(async () => {
          await SplashScreen.hide({
            fadeOutDuration: 400
          });
        }, 300);
      }
    } finally {
      setTimeout(() => {
        this.isNavigating = false;
      }, 500);
    }
  }
}
