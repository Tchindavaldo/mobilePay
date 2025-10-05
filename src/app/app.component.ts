import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase-config';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private isNavigating = false;

  constructor(private router: Router) {
    // Délai pour permettre à Angular de terminer l'initialisation
    setTimeout(() => {
      this.initializeAuth();
    }, 100);
  }

  private initializeAuth() {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    const auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
      // Éviter les redirections multiples
      if (this.isNavigating) return;

      const currentUrl = this.router.url;
      console.log('Auth state changed:', { user: !!user, currentUrl });

      if (user) {
        // L'utilisateur est connecté
        if (currentUrl === '/login' || currentUrl === '/phone-auth' || currentUrl === '/explication' || currentUrl === '/') {
          console.log('Redirecting authenticated user to tabs');
          this.navigateWithFlag(['/tabs/tabs/tab1']);
        }
      } else {
        // L'utilisateur n'est pas connecté
        if (!hasSeenOnboarding && (currentUrl === '/' || currentUrl === '/tabs/tabs/tab1')) {
          // Première visite, montrer l'onboarding
          console.log('Redirecting to onboarding');
          this.navigateWithFlag(['/explication']);
        } else if (currentUrl === '/tabs/tabs/tab1') {
          // Rediriger vers login si essaie d'accéder aux tabs sans être connecté
          console.log('Redirecting unauthenticated user to login');
          this.navigateWithFlag(['/login']);
        }
      }
    });
  }

  private navigateWithFlag(route: string[]) {
    this.isNavigating = true;
    this.router.navigate(route).then(() => {
      setTimeout(() => {
        this.isNavigating = false;
      }, 1000);
    });
  }
}
