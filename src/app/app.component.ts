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

    onAuthStateChanged(auth, async (user) => {
      const currentUrl = this.router.url;
      console.log('Auth state changed:', { user: !!user, currentUrl });

      if (user) {
        // L'utilisateur est connecté

        // Pas de redirection si login Google en cours
        if (this.authState.isGoogleLoginActive()) {
          console.log('🔒 Google login en cours');
          if (this.isFirstLoad) {
            this.isFirstLoad = false;
            await SplashScreen.hide();
          }
          return;
        }

        // Redirection vers le Home si sur une page d'auth/onboarding
        if (currentUrl === '/login' || currentUrl === '/phone-auth' || currentUrl === '/explication' || currentUrl === '/') {
          console.log('Redirecting authenticated user to tabs');
          await this.navigateWithFlag(['/tabs/tab1']);
        }
      } else {
        // L'utilisateur n'est pas connecté
        if (!hasSeenOnboarding) {
          console.log('Redirecting to onboarding');
          await this.navigateWithFlag(['/explication']);
        } else {
          // Si on essaie d'aller sur une page protégée ou la racine, redirection vers login
          if (currentUrl === '/' || currentUrl.includes('/tabs/')) {
            console.log('Redirecting unauthenticated user to login');
            await this.navigateWithFlag(['/login']);
          }
        }
      }

      // Toujours masquer le splash screen natif dès que la première redirection est lancée/décidée
      if (this.isFirstLoad) {
        this.isFirstLoad = false;
        // On attend un tout petit peu que le moteur de rendu commence la navigation
        setTimeout(async () => {
          await SplashScreen.hide();
        }, 500);
      }
    });
  }

  private async navigateWithFlag(route: string[]) {
    this.isNavigating = true;
    try {
      // replaceUrl: true permet de supprimer la page précédente de la pile (évite le retour au login)
      await this.router.navigate(route, { replaceUrl: true });
    } finally {
      setTimeout(() => {
        this.isNavigating = false;
      }, 500);
    }
  }
}
