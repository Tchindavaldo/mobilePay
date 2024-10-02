import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}
  notifications = [
    {
      title: 'Nouveau message',
      message: 'Vous avez reçu un nouveau message.',
      image: '../../assets/th (1).jpeg',
      time: new Date()
    },
    {
      title: 'Mise à jour',
      message: 'La mise à jour du système a été effectuée.',
      image: '../../assets/R.png',
      time: new Date()
    },
    {
      title: 'Avertissement',
      message: 'Votre espace de stockage est presque plein.',
      image: '../../assets/crunch.jpg',
      time: new Date()
    }
  ];

  unreadNotifications = 3; // Exemple : compteur de notifications non lues
  openNotifications() {
    console.log('Notifications ouvertes');
    // Logique pour ouvrir la page ou popup des notifications
  }
}
