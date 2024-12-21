import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-splash.page',
  templateUrl: './splash.page.component.html',
  styleUrls: ['./splash.page.component.scss'],
})
export class SplashPageComponent  implements OnInit {

  // constructor() { }

  // ngOnInit() {}

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    setTimeout(() => {
      this.navCtrl.navigateRoot('/login'); // Rediriger vers la page de connexion
    }, 6000); // Attendre 3 secondes
  }
}
