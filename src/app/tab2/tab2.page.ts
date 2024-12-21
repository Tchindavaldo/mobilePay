import { Component, OnInit } from '@angular/core';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../firebase-config';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';



@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  constructor(private router: Router, private alertController: AlertController) {}
  ngOnInit() {
  }
  user = {
    name: 'Michael Steve',
    bio: 'Passionné par les Films action aventures',
    followers: 1250,
    posts: 50,
    likes: 3400,
    recentActivity: [
      { description: 'A publié une nouvelle photo', date: new Date() },
      { description: 'A aimé une publication', date: new Date() },
      { description: 'A suivi un nouveau compte', date: new Date() }
    ]
  };



  editProfile() {
    // Logique pour éditer le profil
    console.log('Édition du profil en cours...');
    // Tu peux aussi naviguer vers une autre page pour l'édition du profil si nécessaire
  }

  changeProfilePicture() {
    console.log('Changer la photo de profil');
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
