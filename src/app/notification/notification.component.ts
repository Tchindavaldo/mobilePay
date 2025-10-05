import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../notification.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent  implements OnInit {

  notifications: Notification[] = [];
  unreadNotifications = 0;

  constructor(
    private notificationService: NotificationService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.notifications = this.notificationService.getNotifications();

    // S'abonner aux nouvelles notifications
    this.notificationService.getNotificationsObservable().subscribe((notifications) => {
      this.notifications = notifications;
      this.unreadNotifications = notifications.length;
    });
  }

  openNotifications() {
    console.log('Notifications ouvertes');
  }

  async clearAllNotifications() {
    const alert = await this.alertController.create({
      header: 'Supprimer toutes les notifications',
      message: 'Voulez-vous vraiment supprimer toutes les notifications ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'confirm',
          handler: () => {
            this.notificationService.clearAllNotifications();
            this.notifications = [];
            this.unreadNotifications = 0;
          }
        }
      ]
    });

    await alert.present();
  }

  deleteNotification(index: number) {
    this.notifications.splice(index, 1);
    this.unreadNotifications = this.notifications.length;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return notificationDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  }

  onImageError(event: any) {
    event.target.src = 'assets/LOGO.jpg';
  }
}
