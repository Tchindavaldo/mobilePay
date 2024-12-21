import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../firebase-config'; // Utilisez cette ligne
import { Router } from '@angular/router'; // Importer Router ici
import { NotificationService, Notification } from '../notification.service';

import { UserService } from '../user.service';

@Component({
  selector: 'app-login.page',
  templateUrl: './login.page.component.html',
  styleUrls: ['./login.page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  ngOnInit() {
    
  };
  user = {
    name: '',
    email: '',
    password: '',
    phone: ''
  };

  constructor(private alertController: AlertController, private router: Router,private userService: UserService, private notificationService: NotificationService ) {}

  async registerUser() {
    if (this.user.name && this.user.email && this.user.password && this.user.phone) {
      const auth = getAuth(app);
      
      try {
        // Créer un nouvel utilisateur
        const userCredential = await createUserWithEmailAndPassword(auth, this.user.email, this.user.password);
        
        // this.userService.setUserName(this.user.name); 

        // Afficher une alerte de succès 
        const alert = await this.alertController.create({
          header: 'Inscription Réussie',
          message: `Bienvenue, ${this.user.name}!`,
          buttons: ['OK']
        });

        await alert.present();

        // Rediriger l'utilisateur après l'inscription réussie (par exemple vers la page d'accueil)
         this.router.navigate(['/forms']);
                   // Émettre une notification
    const notification: Notification = {
      title: 'Compte',
      message: 'Votre compte a ete creer avec succes.',
      image: '../../assets/LOGO.jpg',
      time: new Date(),
    };
    this.notificationService.addNotification(notification);
      } catch (error: any) { // Typage de l'erreur
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: error.message || 'Une erreur est survenue.', // Utiliser une valeur par défaut
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Veuillez remplir tous les champs.',
        buttons: ['OK']
      });

      await alert.present();
    }
  }


}
