import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-splash.page',
  templateUrl: './splash.page.component.html',
  styleUrls: ['./splash.page.component.scss'],
})
export class SplashPageComponent implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    console.log('🚪 [PAGE] SplashPage: ngOnInit (Page affichée - Chargement en cours)');
  }
}
