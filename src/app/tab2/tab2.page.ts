import { Component, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase-config';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { UserStorageService } from '../services/storage/user-storage.service';
import { GoogleAuthService } from '../services/google-auth.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  user = {
    name: 'Michael Steve',
    bio: 'Passionné par les Films action aventures',
    photoURL: '../../assets/31988.jpg',
    followers: 1250,
    posts: 50,
    likes: 3400
  };

  userName: string | null = null;
  userPhoto: string | null = null;
  notificationCount: number = 0;

  constructor(
    private router: Router,
    private alertController: AlertController,
    public langService: LanguageService,
    private userStorage: UserStorageService,
    private googleAuthService: GoogleAuthService
  ) { }

  t(key: string): string {
    return this.langService.translate(key);
  }

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    const auth = getAuth(app);

    const storedUserName = await this.userStorage.get('userName');
    const storedUserPhoto = await this.userStorage.get('userPhoto');

    if (storedUserName) {
      this.userName = storedUserName;
      this.userPhoto = storedUserPhoto;
      this.user.name = storedUserName;
      if (storedUserPhoto) {
        this.user.photoURL = storedUserPhoto;
      }
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        let fullName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
        this.userName = fullName;
        this.userPhoto = user.photoURL;
        this.user.name = fullName;
        if (user.photoURL) {
          this.user.photoURL = user.photoURL;
        }

        await this.userStorage.set('userName', fullName);
        if (user.photoURL) {
          await this.userStorage.set('userPhoto', user.photoURL);
        }
      } else {
        if (!this.userName) {
          this.userName = 'Utilisateur';
          this.userPhoto = null;
        }
      }
    });
  }

  editProfile() {
    console.log('Édition du profil en cours...');
  }

  changeProfilePicture() {
    console.log('Changer la photo de profil');
  }

  getUserPhoto(): string {
    return this.userPhoto || 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

  onImageError(event: any) {
    event.target.src = 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

  viewDetailedStats() {
    console.log('Voir les statistiques détaillées');
  }

  changePassword() {
    console.log('Changer le mot de passe');
  }

  async logout() {
    try {
      await this.googleAuthService.signOut();
      const alert = await this.alertController.create({
        header: 'Déconnexion',
        message: 'Vous êtes déconnecté.',
        buttons: ['OK']
      });
      await alert.present();

      // Redirigez vers la page de connexion
      this.router.navigate(['/login']);
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Erreur lors de la déconnexion.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
