import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { Store } from '@ngrx/store';
import { AppState } from '../services/store/indx';
import { GetUserNotificationService } from '../services/notifications/request/get-user-notification.service';
import { UserStorageService } from '../services/storage/user-storage.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  unreadNotifications = 0;
  userId: string | null = null;
  private sub: Subscription | null = null;

  constructor(
    private alertController: AlertController,
    private languageService: LanguageService,
    private store: Store<AppState>,
    private getUserNotificationService: GetUserNotificationService,
    private userStorage: UserStorageService,
    private navCtrl: NavController,
    private socketService: SocketService
  ) { }

  t(key: string): string {
    return this.languageService.translate(key);
  }

  async ngOnInit() {
    const user = await this.userStorage.get('user');
    if (user) {
      this.userId = user._id || user.id || user.uid;
      this.getUserNotificationService.getNotification();
    }

    this.sub = this.store.select(state => state.userNotification?.Notification).subscribe(notifications => {
      if (notifications) {
        // Normaliser et trier les notifications
        this.notifications = [...notifications].map(n => ({
          ...n,
          // Unifier body et message
          body: n.body || n.message || '',
          // S'assurer qu'on a une date
          createdAt: n.createdAt || n.date || new Date().toISOString()
        })).sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });

        // Calculer les non lues (où userId n'est pas dans isRead)
        if (this.userId) {
          this.unreadNotifications = this.notifications.filter(n => {
            const isReadArray = Array.isArray(n.isRead) ? n.isRead :
              (typeof n.isRead === 'string' ? JSON.parse(n.isRead) : []);
            return !isReadArray.includes(this.userId!);
          }).length;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  goBack() {
    this.navCtrl.back();
  }

  async markAsRead(notification: any) {
    const isRead = Array.isArray(notification.isRead) ? notification.isRead :
      (typeof notification.isRead === 'string' ? JSON.parse(notification.isRead) : []);

    if (this.userId && !isRead.includes(this.userId)) {
      this.socketService.getSocket().emit('isReadNotification', {
        userId: this.userId,
        notificationId: notification.id,
        notificationIdGroup: notification.idGroup
      });
    }
  }

  async clearAllNotifications() {
    // Logic for clearing notifications if needed
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return this.t('notification.just_now') || 'À l\'instant';
    if (diffMins < 60) return `${diffMins} ${this.t('notification.min_ago') || 'min'}`;
    if (diffHours < 24) return `${diffHours}h ${this.t('notification.ago') || ''}`;
    if (diffDays === 1) return this.t('notification.yesterday') || 'Hier';
    if (diffDays < 7) return `${diffDays} ${this.t('notification.days_ago') || 'jours'}`;

    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  onImageError(event: any) {
    event.target.src = 'assets/icon/opp.png';
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'payment':
      case 'success':
        return 'card-outline';
      case 'subscription':
      case 'info':
        return 'ribbon-outline';
      case 'security':
      case 'warning':
        return 'shield-checkmark-outline';
      default:
        return 'notifications-outline';
    }
  }

  isRead(notification: any): boolean {
    if (!this.userId) return true;
    const isRead = Array.isArray(notification.isRead) ? notification.isRead :
      (typeof notification.isRead === 'string' ? JSON.parse(notification.isRead) : []);
    return isRead.includes(this.userId);
  }
}
