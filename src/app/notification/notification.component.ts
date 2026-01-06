import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../notification.service';
import { AlertController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';

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
    private alertController: AlertController,
    private languageService: LanguageService
  ) {}

  t(key: string): string {
    return this.languageService.translate(key);
  }

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
      header: this.t('notification.delete_all'),
      message: this.t('notification.delete_all_confirm'),
      buttons: [
        {
          text: this.t('cancel'),
          role: 'cancel'
        },
        {
          text: this.t('notification.delete'),
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
    const lang = this.languageService.getCurrentLanguage();

    if (diffMins < 1) {
      return this.t('notification.just_now');
    } else if (diffMins < 60) {
      return `${diffMins} ${this.t('notification.min_ago')}`;
    } else if (diffHours < 24) {
      return `${diffHours}${this.t('notification.hours_ago')}`;
    } else if (diffDays === 1) {
      return this.t('notifications.yesterday');
    } else if (diffDays < 7) {
      return `${diffDays} ${this.t('notification.days_ago')}`;
    } else {
      const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-FR';
      return notificationDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    }
  }

  onImageError(event: any) {
    event.target.src = 'assets/LOGO.jpg';
  }
}
