import { Component, OnInit } from '@angular/core';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase-config';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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

  constructor(private router: Router, private alertController: AlertController) {}
  
  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const auth = getAuth(app);

    const storedUserName = localStorage.getItem('userName');
    const storedUserPhoto = localStorage.getItem('userPhoto');

    if (storedUserName) {
      this.userName = storedUserName;
      this.userPhoto = storedUserPhoto;
      this.user.name = storedUserName;
      if (storedUserPhoto) {
        this.user.photoURL = storedUserPhoto;
      }
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        let fullName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
        this.userName = fullName;
        this.userPhoto = user.photoURL;
        this.user.name = fullName;
        if (user.photoURL) {
          this.user.photoURL = user.photoURL;
        }

        localStorage.setItem('userName', fullName);
        if (user.photoURL) {
          localStorage.setItem('userPhoto', user.photoURL);
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
    if (!this.userPhoto) {
      const storedPhoto = localStorage.getItem('userPhoto');
      if (storedPhoto) {
        this.userPhoto = storedPhoto;
      }
    }
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
    const auth = getAuth(app);
    
    try {
      await signOut(auth);
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
