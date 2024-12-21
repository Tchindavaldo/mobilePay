import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent  implements OnInit {

 
  notifications: Notification[] = [];
  unreadNotifications = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notifications = this.notificationService.getNotifications();

    // S'abonner aux nouvelles notifications
    this.notificationService.getNotificationsObservable().subscribe((notifications) => {
      this.notifications = notifications;
      this.unreadNotifications = notifications.length; // Mettre à jour le compteur des notifications non lues
    });
  }

  openNotifications() {
    console.log('Notifications ouvertes');
    // Logique pour ouvrir la page ou popup des notifications
  }
}
