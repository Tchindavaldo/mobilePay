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
      const loading = await this.loadingController.create({
        message: 'Connexion en cours...',
        spinner: 'crescent'
      });
      await loading.present();

      const auth = getAuth(app);

      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.user.email, this.user.password);
        await loading.dismiss();

        const notification: Notification = {
          title: 'Connexion',
          message: 'Vous êtes maintenant connecté.',
          image: '../../assets/LOGO.jpg',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

        await this.router.navigate(['/tabs/tab1']);

      } catch (error: any) {
        await loading.dismiss();
        
        let errorMessage = 'Une erreur est survenue.';
        
        if (error.code === 'auth/invalid-email') {
          errorMessage = 'L\'adresse email est invalide.';
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'Ce compte a été désactivé.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'Aucun compte ne correspond à cette adresse email.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Le mot de passe est incorrect.';
        } else if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
        }

        const alert = await this.alertController.create({
          header: 'Erreur de connexion',
          message: errorMessage,
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Champs manquants',
        message: 'Veuillez remplir tous les champs.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async registerUser() {
    if (this.user.name && this.user.email && this.user.password && this.user.phone) {
      const loading = await this.loadingController.create({
        message: 'Création du compte...',
        spinner: 'crescent'
      });
      await loading.present();

      const auth = getAuth(app);
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.user.email, this.user.password);
        await loading.dismiss();

        const notification: Notification = {
          title: 'Compte',
          message: 'Votre compte a été créé avec succès.',
          image: '../../assets/LOGO.jpg',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

        await this.router.navigate(['/tabs/tab1']);

      } catch (error: any) {
        await loading.dismiss();
        
        let errorMessage = 'Une erreur est survenue.';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Cette adresse email est déjà utilisée.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'L\'adresse email est invalide.';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'L\'inscription par email est désactivée.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
        }

        const alert = await this.alertController.create({
          header: 'Erreur d\'inscription',
          message: errorMessage,
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Champs manquants',
        message: 'Veuillez remplir tous les champs.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async signInWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Connexion avec Google...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    try {
      console.log('🔐 Début de l\'authentification Google...');
      
      const user = await this.googleAuthService.signInWithGoogle();

      if (user) {
        console.log('✓ Connexion complète réussie !');
        
        const notification: Notification = {
          title: 'Connexion Google',
          message: `Bienvenue ${user.displayName || user.email} !`,
          image: user.photoURL || '../../assets/LOGO.jpg',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

        await loading.dismiss();
        
        console.log('Redirection vers /tabs/tab1...');
        await this.router.navigate(['/tabs/tab1']);

      } else {
        await loading.dismiss();
        
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de récupérer les informations utilisateur.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error);
      await loading.dismiss();

      let errorMessage = 'Impossible de se connecter avec Google.';
      
      if (error.message.includes('annulée')) {
        errorMessage = 'Connexion annulée.';
      } else if (error.message.includes('Popup bloquée')) {
        errorMessage = 'Popup bloquée. Autorisez les popups pour ce site.';
      } else if (error.message.includes('réseau') || error.message.includes('network')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      const alert = await this.alertController.create({
        header: 'Erreur de connexion',
        message: errorMessage,
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
