import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase-config'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router) {
    const auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // L'utilisateur est connecté, redirigez vers la page d'accueil
        this.router.navigate(['/tabs/tab1']); // Changez le chemin vers votre page d'accueil
      } else {
        // L'utilisateur n'est pas connecté, vous pouvez le rediriger vers la page de connexion
        this.router.navigate(['/login']); // Changez le chemin vers votre page de connexion
      }
    });
  }
}
