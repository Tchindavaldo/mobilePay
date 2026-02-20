import { Component, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
    const hasSeenOnboarding = await this.userStorage.get('hasSeenOnboarding') === true || await this.userStorage.get('hasSeenOnboarding') === 'true';
    const auth = getAuth(app);
    console.log('🧭 [ANGULAR] Firebase Auth instance obtained.');

    onAuthStateChanged(auth, async (user) => {
      const currentUrl = this.router.url;
      console.log('🧭 [ANGULAR] !!! onAuthStateChanged !!! - User:', !!user, 'URL now:', currentUrl);

      // Éviter le flash du login si on vient d'une notification
      if (this.isFirstLoad) {
        console.log('🧭 [ANGULAR] isFirstLoad=true. Waiting 300ms for notification plugin...');
        // Laisser un court instant aux plugins Capacitor pour déclencher l'action de notification
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('🧭 [ANGULAR] Delay finished. Current URL is:', this.router.url);
      }

      if (user) {
        // L'utilisateur est connecté

        // Pas de redirection si login Google en cours
        if (this.authState.isGoogleLoginActive()) {
          console.log('🧭 [ANGULAR] Google login in progress, stopping redirection.');
          if (this.isFirstLoad) {
            this.isFirstLoad = false;
            await SplashScreen.hide();
          }
          return;
        }

        // Redirection vers le Home si sur une page d'auth/onboarding/splash
        if (currentUrl === '/login' || currentUrl === '/phone-auth' || currentUrl === '/explication' || currentUrl === '/' || currentUrl === '/splash') {
          console.log('🧭 [ANGULAR] Authenticated user on auth/splash page. Redirecting to /tabs/tab1');
          await this.navigateWithFlag(['/tabs/tab1']);
        }
      } else {
        // L'utilisateur n'est pas connecté
        if (!hasSeenOnboarding) {
          console.log('🧭 [ANGULAR] New user. Redirecting to /explication');
          await this.navigateWithFlag(['/explication']);
        } else {
          // Si on essaie d'aller sur une page protégée ou la racine/splash, redirection vers login
          if (currentUrl === '/' || currentUrl === '/splash' || currentUrl.includes('/tabs/')) {
            console.log('🧭 [ANGULAR] Unauthenticated. Redirecting to /login');
            await this.navigateWithFlag(['/login']);
          }
        }
      }

      // Le masquage du splash screen est maintenant géré à la fin de navigateWithFlag
      // pour garantir une transition fluide vers la première page réelle de l'app.
    });

    // SÉCURITÉ : Masquer le splash screen après un délai maximum si l'Auth ne répond pas
    // Cela évite de rester bloqué indéfiniment sur iOS
    setTimeout(async () => {
      if (this.isFirstLoad) {
        console.warn('⚠️ [ANGULAR] Auth long à répondre (30s). Masquage forcé du Splash Screen.');
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
