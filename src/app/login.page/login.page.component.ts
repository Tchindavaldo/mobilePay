import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../firebase-config';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../notification.service';
import { UserService } from '../user.service';
import { GoogleAuthService } from '../services/google-auth.service';

@Component({
  selector: 'app-login.page',
  templateUrl: './login.page.component.html',
  styleUrls: ['./login.page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  showEmailForm = false;
  showRegisterForm = false;

  user = {
    name: '',
    email: '',
    password: '',
    phone: ''
  };

  constructor(
    private alertController: AlertController,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private googleAuthService: GoogleAuthService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  showEmailLogin() {
    this.showEmailForm = true;
    this.showRegisterForm = false;
  }

  showRegister() {
    this.showRegisterForm = true;
    this.showEmailForm = false;
  }

  showLogin() {
    this.showEmailForm = true;
    this.showRegisterForm = false;
  }

  backToMainLogin() {
    this.showEmailForm = false;
    this.showRegisterForm = false;
  }

  showPhoneAuth() {
    this.router.navigate(['/phone-auth']);
  }

  async loginUser() {
    if (this.user.email && this.user.password) {
      const auth = getAuth(app);

      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.user.email, this.user.password);

        const alert = await this.alertController.create({
          header: 'Connexion Réussie',
          message: 'Bienvenue !',
          buttons: ['OK']
        });

        await alert.present();
        this.router.navigate(['/tabs/tab1']);

        const notification: Notification = {
          title: 'Connexion',
          message: 'Vous êtes maintenant connecté.',
          image: '../../assets/LOGO.jpg',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

      } catch (error: any) {
        const alert = await this.alertController.create({
          header: 'Erreur de connexion',
          message: error.message || 'Email ou mot de passe incorrect.',
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

        this.router.navigate(['/tabs/tab1']);

        const notification: Notification = {
          title: 'Compte',
          message: 'Votre compte a été créé avec succès.',
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

  async signInWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Connexion avec Google...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const user = await this.googleAuthService.signInWithGoogle();

      if (user) {
        await loading.dismiss();

        // Ajouter une notification
        const notification: Notification = {
          title: 'Connexion Google',
          message: `Vous êtes connecté avec Google.`,
          image: user.photoURL || '../../assets/LOGO.jpg',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

        // Rediriger immédiatement vers l'application
        console.log('Google auth success, redirecting to tabs');

        // Utiliser setTimeout pour s'assurer que la redirection se fait
        setTimeout(() => {
          this.router.navigate(['/tabs/tabs/tab1']).then(success => {
            console.log('Navigation success:', success);
            if (!success) {
              console.error('Navigation failed, trying alternative route');
              window.location.href = '/tabs/tabs/tab1';
            }
          });
        }, 100);

        // Afficher l'alerte après la redirection (optionnel)
        setTimeout(() => {
          this.alertController.create({
            header: 'Connexion réussie',
            message: `Bienvenue ${user.displayName || user.email} !`,
            buttons: ['OK']
          }).then(alert => alert.present());
        }, 1000);
      }
    } catch (error: any) {
      await loading.dismiss();

      const alert = await this.alertController.create({
        header: 'Erreur de connexion',
        message: error.message || 'Impossible de se connecter avec Google.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async registerWithGoogle() {
    // Pour l'inscription, on utilise la même méthode que la connexion
    // car Google gère automatiquement la création de compte
    await this.signInWithGoogle();
  }
}
