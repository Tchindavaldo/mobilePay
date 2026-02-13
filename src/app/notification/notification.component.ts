import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { Store } from '@ngrx/store';
import { AppState } from '../services/store/app-state.interface';
import { GetUserNotificationService } from '../services/notifications/request/get-user-notification.service';
import { UserStorageService } from '../services/storage/user-storage.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket/socket.service';
import { markNotificationAsReadReducer } from '../services/store/notification/notification-reducer';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  unreadNotifications = 0;
  userId: string | null = null;
  isLoading = false;
  hasError = false;
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
      this.userId = user.id;
    }

    // Abonnement simple au store
    this.sub = this.store.select(state => state.userNotification?.Notification).subscribe(notifications => {
      if (notifications) {
        this.notifications = [...notifications].map(n => ({
          ...n,
          body: n.body || n.message || '',
          createdAt: n.createdAt || n.date || new Date().toISOString()
        })).sort((a, b) => {
          const dateB = new Date(b.createdAt).getTime();
          const dateA = new Date(a.createdAt).getTime();
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });

        if (this.userId) {
          this.unreadNotifications = this.notifications.filter(n => {
            const isReadArray = Array.isArray(n.isRead) ? n.isRead : [];
            return !isReadArray.includes(this.userId!);
          }).length;
        }
      }
    });

    // Chargement initial
    if (this.notifications.length === 0) {
      this.loadNotifications();
    } else {
      this.getUserNotificationService.getNotification().catch(() => { });
    }

    this.processPendingReadActions();
  }

  async loadNotifications() {
    try {
      this.isLoading = true;
      this.hasError = false;
      await this.getUserNotificationService.getNotification();
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
      this.hasError = true;
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  goBack() {
    this.navCtrl.back();
  }

  async markAsRead(notification: any) {
    if (!this.userId) return;

    const isReadArray = Array.isArray(notification.isRead) ? notification.isRead : [];

    if (!isReadArray.includes(this.userId)) {
      this.store.dispatch(markNotificationAsReadReducer({
        notificationId: notification.id,
        userId: this.userId
      }));

      const markData = {
        userId: this.userId,
        notificationId: notification.id,
        notificationIdGroup: notification.idGroup
      };

      try {
        this.socketService.getSocket().emit('isReadNotification', markData);
      } catch (e) {
        this.savePendingReadAction(markData);
      }
    }
  }

  private async savePendingReadAction(data: any) {
    try {
      const pending = await this.userStorage.get('pending_read_notifications') || [];
      pending.push(data);
      await this.userStorage.set('pending_read_notifications', pending);
    } catch (e) { }
  }

  private async processPendingReadActions() {
    try {
      const pending = await this.userStorage.get('pending_read_notifications');
      if (pending && pending.length > 0) {
        const socket = this.socketService.getSocket();
        if (socket && socket.connected) {
          pending.forEach((data: any) => socket.emit('isReadNotification', data));
          await this.userStorage.remove('pending_read_notifications');
        }
      }
    } catch (e) { }
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
    const isReadArray = Array.isArray(notification.isRead) ? notification.isRead : [];
    return isReadArray.includes(this.userId);
  }

  trackByNotificationId(index: number, notification: any) {
    return notification.id;
  }
}
