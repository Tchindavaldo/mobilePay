import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../firebase-config';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../notification.service';
import { UserService } from '../user.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { GetUserService } from '../services/user/requests/get-user.service';
import { CreateUserService, CreateUserDto } from '../services/user/requests/create-user.service';
import { UpdateUserService, UpdateUserDto } from '../services/user/requests/update-user.service';
import { UserStorageService } from '../services/storage/user-storage.service';
import { UserDataService } from '../services/user/data/user-data.service';
import { SocketService } from '../services/socket/socket.service';
import { InitSessionSocketService } from '../services/socket/init-session-socket.service';

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

  errorMessage: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private googleAuthService: GoogleAuthService,
    private loadingController: LoadingController,
    private getUserService: GetUserService,
    private createUserService: CreateUserService,
    private updateUserService: UpdateUserService,
    private userStorage: UserStorageService,
    private userData: UserDataService,
    private socketService: SocketService,
    private sessionSocketService: InitSessionSocketService
  ) { }

  ngOnInit() { }

  showEmailLogin() {
    this.showEmailForm = true;
    this.showRegisterForm = false;
    this.errorMessage = '';
  }

  showRegister() {
    this.showRegisterForm = true;
    this.showEmailForm = false;
    this.errorMessage = '';
  }

  showLogin() {
    this.showEmailForm = true;
    this.showRegisterForm = false;
    this.errorMessage = '';
  }

  backToMainLogin() {
    this.showEmailForm = false;
    this.showRegisterForm = false;
    this.errorMessage = '';
  }

  showPhoneAuth() {
    this.router.navigate(['/phone-auth']);
  }

  async loginUser() {
    this.errorMessage = '';
    if (this.user.email && this.user.password) {
      const loading = await this.loadingController.create({
        message: 'Connexion en cours...',
        spinner: 'crescent'
      });
      await loading.present();

      const auth = getAuth(app);

      try {
        // 1. Authentification Firebase
        const userCredential = await signInWithEmailAndPassword(auth, this.user.email, this.user.password);
        const firebaseUser = userCredential.user;

        // 2. Vérification Backend
        let backendUser = await this.getUserService.getUserByEmail(this.user.email);

        // Préparer les données
        const authData: CreateUserDto | UpdateUserDto = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || this.user.name || '',
          photoURL: firebaseUser.photoURL || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          accessToken: (firebaseUser as any).accessToken,
          metadata: {
            lastSignInTime: firebaseUser.metadata.lastSignInTime,
            creationTime: firebaseUser.metadata.creationTime
          }
        };

        if (backendUser) {
          // 3. Mise à jour Backend
          const userId = backendUser._id || backendUser.id;
          backendUser = await this.updateUserService.updateUser(userId, authData);
        } else {
          // 3. Création Backend (si n'existe pas)
          backendUser = await this.createUserService.createUser(authData as CreateUserDto);
        }

        // 4. Stockage Local
        await this.userStorage.set('user', backendUser);

        // 5. Mise à jour UserData
        await this.userData.initCurrentUser();

        // 6. Socket
        const socket = this.socketService.getSocket();
        await this.sessionSocketService.initializeSocket(socket);

        await loading.dismiss();

        // Notification de succès
        const notification: Notification = {
          title: 'Connexion',
          message: 'Vous êtes maintenant connecté.',
          image: '../../assets/icon/opp.png',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

        this.router.navigate(['/tabs/tab1']);

      } catch (error: any) {
        await loading.dismiss();
        console.error('Login error:', error);

        // Messages d'erreur personnalisés en français
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.code === 'auth/invalid-email') {
          this.errorMessage = 'Format d\'email invalide.';
        } else if (error.code === 'auth/too-many-requests') {
          this.errorMessage = 'Trop de tentatives échouées. Veuillez réessayer plus tard.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la connexion.';
        }
      }
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs.';
    }
  }

  async registerUser() {
    this.errorMessage = '';
    if (this.user.name && this.user.email && this.user.password && this.user.phone) {
      const loading = await this.loadingController.create({
        message: 'Création du compte...',
        spinner: 'crescent'
      });
      await loading.present();

      const auth = getAuth(app);

      try {
        // 1. Création Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, this.user.email, this.user.password);
        const firebaseUser = userCredential.user;

        // 2. Création Backend
        const authData: CreateUserDto = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: this.user.name,
          phoneNumber: this.user.phone,
          photoURL: '',
          password: this.user.password, // Sauvegarde du mot de passe en dur
          accessToken: (firebaseUser as any).accessToken,
          metadata: {
            creationTime: firebaseUser.metadata.creationTime,
            lastSignInTime: firebaseUser.metadata.lastSignInTime
          }
        };

        const backendUser = await this.createUserService.createUser(authData);

        // 3. Stockage Local
        await this.userStorage.set('user', backendUser);

        // 4. Mise à jour UserData
        await this.userData.initCurrentUser();

        // 5. Socket
        const socket = this.socketService.getSocket();
        await this.sessionSocketService.initializeSocket(socket);

        await loading.dismiss();

        // Notification de succès
        const notification: Notification = {
          title: 'Compte',
          message: 'Votre compte a été créé avec succès.',
          image: 'assets/icon/opp.png',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

        this.router.navigate(['/tabs/tab1']);

      } catch (error: any) {
        await loading.dismiss();
        console.error('Registration error:', error);

        // Messages d'erreur personnalisés
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'Cet email est déjà utilisé par un autre compte.';
        } else if (error.code === 'auth/weak-password') {
          this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
        } else if (error.code === 'auth/invalid-email') {
          this.errorMessage = 'Format d\'email invalide.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription.';
        }
      }
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs.';
    }
  }

  async signInWithGoogle() {
    const loading = await this.loadingController.create({
      message: '🔐 Connexion avec Google...',
      spinner: 'crescent',
      backdropDismiss: false // Empêcher de fermer le loader en cliquant à côté
    });
    await loading.present();

    try {
      console.log('🔐 Début de l\'authentification Google...');

      const user = await this.googleAuthService.signInWithGoogle();

      if (user) {
        console.log('✓ Connexion complète réussie !');

        // Mettre à jour le message du loader avant de rediriger
        loading.message = '✓ Connexion réussie ! Redirection...';

        // Ajouter une notification
        const notification: Notification = {
          title: 'Connexion Google',
          message: `Bienvenue ${user.displayName || user.email} !`,
          image: user.photoURL || 'assets/icon/opp.png',
          time: new Date(),
        };
        this.notificationService.addNotification(notification);

        // Petite pause pour montrer le message de succès
        await new Promise(resolve => setTimeout(resolve, 800));

        // Dismiss le loader
        await loading.dismiss();

        // Rediriger vers l'application
        console.log('Redirection vers /tabs/tab1...');
        const navigationSuccess = await this.router.navigate(['/tabs/tab1']);

        if (!navigationSuccess) {
          console.error('Navigation failed, trying alternative route');
          window.location.href = '/tabs/tab1';
        }

        // Afficher l'alerte de bienvenue après la redirection
        setTimeout(async () => {
          const alert = await this.alertController.create({
            header: '🎉 Connexion réussie',
            message: `Bienvenue ${user.displayName || user.email} !`,
            buttons: ['OK']
          });
          await alert.present();
        }, 500);
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
