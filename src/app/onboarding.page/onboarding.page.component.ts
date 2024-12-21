import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';



@Component({
  selector: 'app-onboarding.page',
  templateUrl: './onboarding.page.component.html',
  styleUrls: ['./onboarding.page.component.scss'],
})
export class OnboardingPageComponent  implements OnInit {

  // constructor() { }

  ngOnInit() {}

 
  days: number = -28; // Initialiser à -28
  countdownInterval: any;

  constructor() {}

  startCountdown() {
    // Si le compte à rebours est déjà en cours, l'empêcher de redémarrer
    if (this.countdownInterval) {
      return;
    }

    // Décrémenter de 1 chaque jour
    this.countdownInterval = setInterval(() => {
      if (this.days < 0) {
        this.days += 1; // Incrémenter vers 0
      } else {
        clearInterval(this.countdownInterval); // Arrêter le compte à rebours une fois arrivé à 0
      }
    }, 24 * 60 * 60 * 1000); // Décrémenter toutes les 24 heures
  }
}
