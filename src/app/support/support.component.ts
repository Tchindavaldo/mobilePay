import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})

export class SupportComponent  implements OnInit {


  ngOnInit() {}
  userName: string = '';
  userEmail: string = '';
  subject: string = '';
  message: string = '';

  constructor() {}

  sendMessage() {
    console.log('Message envoyé:', {
      name: this.userName,
      email: this.userEmail,
      subject: this.subject,
      message: this.message
    });
    // Logique pour envoyer le message au support
  }

  contactSupport(method: string) {
    if (method === 'email') {
      window.open('mailto:wawomic@gmail.com');
    } else if (method === 'chat') {
      // Logique pour ouvrir le chat en direct
    } else if (method === 'phone') {
      window.open('tel:+237698178925');
    }
  }

  openFAQ() {
    // Rediriger vers la FAQ
    console.log('FAQ ouverte');
  }

  openDocumentation() {
    // Rediriger vers la documentation
    console.log('Documentation ouverte');
  }

  openTutorials() {
    // Rediriger vers les tutoriels vidéos
    console.log('Tutoriels vidéos ouverts');
  }
}
