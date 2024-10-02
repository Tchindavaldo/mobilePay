import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-login.page',
  templateUrl: './login.page.component.html',
  styleUrls: ['./login.page.component.scss'],
})
export class LoginPageComponent  implements OnInit {

  // constructor() { }

  ngOnInit() {}
  user = {
    name: '',
    email: '',
    password: '',
    phone: ''
  };

  constructor(private alertController: AlertController) {}

  async registerUser() {
    if (this.user.name && this.user.email && this.user.password && this.user.phone) {
      const alert = await this.alertController.create({
        header: 'Inscription Réussie',
        message: `Bienvenue, ${this.user.name}!`,
        buttons: ['OK']
      });

      await alert.present();
      // Redirige l'utilisateur après l'inscription réussie
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
