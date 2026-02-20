import { Component, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { initializeAuth, onAuthStateChanged, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';
import { app } from '../firebase-config';
import { AuthStateService } from './services/auth-state.service';
import { FcmService } from './services/notifications/FCM/fcm.service';
import { Platform, IonRouterOutlet } from '@ionic/angular';
import { UserStorageService } from './services/storage/user-storage.service';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private isNavigating = false;
  private isFirstLoad = true;
  private auth: any;

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
      const rootPages = ['/tabs/tab1', '/tabs/tab4', '/tabs/activations', '/tabs/tab2', '/tabs/tab3', '/login', '/explication', '/'];

      if (rootPages.some(page => url === page)) {
        App.exitApp();
      } else {
        processNextHandler();
      }
    });
  }

  private async initializeAuth() {
    // Initialisation robuste pour iOS/Android
    // On utilise indexedDBLocalPersistence car sur iOS c'est le seul qui ne gèle pas au démarrage
    if (Capacitor.isNativePlatform()) {
      this.auth = initializeAuth(app, {
        persistence: indexedDBLocalPersistence
      });
      console.log('🧭 [ANGULAR] Firebase Initialized for NATIVE with indexedDB');
    } else {
      this.auth = initializeAuth(app, {
        persistence: browserLocalPersistence
      });
      console.log('🧭 [ANGULAR] Firebase Initialized for WEB');
    }

    onAuthStateChanged(this.auth, (user) => {
      this.handleAuthStateChange(user);
    });

    // Sécurité Splash Screen
    setTimeout(async () => {
      if (this.isFirstLoad) {
        console.warn('⚠️ Force hide splash after 15s');
        this.isFirstLoad = false;
        await SplashScreen.hide();
      }
    }, 15000);
  }

  private async handleAuthStateChange(user: any) {
    const currentUrl = this.router.url;
    console.log('🧭 [ANGULAR] Auth Event - User:', !!user, 'URL:', currentUrl);

    const hasSeenOnboarding = await this.userStorage.get('hasSeenOnboarding') === true ||
      await this.userStorage.get('hasSeenOnboarding') === 'true';

    if (this.isFirstLoad && (currentUrl === '/' || currentUrl === '/splash')) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (user) {
      if (this.authState.isGoogleLoginActive()) {
        if (this.isFirstLoad) {
          this.isFirstLoad = false;
          SplashScreen.hide();
        }
        return;
      }

      if (currentUrl === '/login' || currentUrl === '/phone-auth' || currentUrl === '/explication' || currentUrl === '/' || currentUrl === '/splash') {
        await this.navigateWithFlag(['/tabs/tab1']);
      }
    } else {
      if (!hasSeenOnboarding) {
        await this.navigateWithFlag(['/explication']);
      } else if (currentUrl === '/' || currentUrl === '/splash' || currentUrl.includes('/tabs/')) {
        await this.navigateWithFlag(['/login']);
      }
    }
  }

  private async navigateWithFlag(route: string[]) {
    this.isNavigating = true;
    try {
      await this.router.navigate(route, { replaceUrl: true });
      if (this.isFirstLoad) {
        this.isFirstLoad = false;
        setTimeout(async () => {
          await SplashScreen.hide();
        }, 300);
      }
    } finally {
      setTimeout(() => { this.isNavigating = false; }, 500);
    }
  }
}
