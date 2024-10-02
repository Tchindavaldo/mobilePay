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

  constructor(private navCtrl: NavController) {}

  closeSlides() {
    this.navCtrl.navigateRoot('/home');
  }

  startApp() {
    this.navCtrl.navigateRoot('/home');
  }
}
