import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../../firebase-config';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  private langSubscription?: Subscription;
  userProfile = {
    name: 'Utilisateur',
    email: '',
    phone: '',
    avatar: '',
    joinDate: '',
    status: ''
  };

  private userPhoto: string | null = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    public langService: LanguageService
  ) { }

  ngOnDestroy() {
    this.langSubscription?.unsubscribe();
  }

  t(key: string): string {
    return this.langService.translate(key);
  }

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    const auth = getAuth(app);

    const storedUserName = localStorage.getItem('userName');
    const storedUserPhoto = localStorage.getItem('userPhoto');

    if (storedUserName) {
      this.userProfile.name = storedUserName;
      this.userPhoto = storedUserPhoto;
    }

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        return;
      }

      const fullName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
      this.userProfile.name = fullName;
      this.userProfile.email = user.email || '';
      this.userPhoto = user.photoURL || this.userPhoto;

      localStorage.setItem('userName', fullName);
      if (this.userPhoto) {
        localStorage.setItem('userPhoto', this.userPhoto);
      }
    });
  }

  goBack() {
    window.history.back();
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

  editProfile() {
    console.log('Éditer le profil');
  }

  changeAvatar() {
    console.log('Changer l\'avatar');
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
