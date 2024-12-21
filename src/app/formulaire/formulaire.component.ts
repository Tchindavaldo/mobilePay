import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../firebase-config';
import { Router } from '@angular/router'; // Importer Router ici

@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.scss'],
})
export class FormulaireComponent implements OnInit {
  user = {
    email: '',
    password: ''
  };

  constructor(private alertController: AlertController, private router: Router) {} // Injecter Router ici

  ngOnInit() {}

  async loginUser() {
    const auth = getAuth(app);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, this.user.email, this.user.password);
      const alert = await this.alertController.create({
        header: 'Connexion Réussie',
        message: 'Bienvenue !',
        buttons: ['OK']
      });

      await alert.present();

      // Rediriger vers la page d'accueil
      this.router.navigate(['/tabs/tab1']); // Cela fonctionnera maintenant
    } catch (error: any) {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: error.message || 'Une erreur est survenue.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
