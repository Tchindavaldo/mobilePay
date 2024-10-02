import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.scss'],
})
export class FormulaireComponent  implements OnInit {

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
