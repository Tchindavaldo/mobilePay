import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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

  localReadStatus: Set<string> = new Set(); // Radical : Gestion locale de l'état "lu" pour l'UI instantanée

  constructor(
    private alertController: AlertController,
    private languageService: LanguageService,
    private store: Store<AppState>,
    private getUserNotificationService: GetUserNotificationService,
    private userStorage: UserStorageService,
    private navCtrl: NavController,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) { }

  t(key: string): string {
    return this.languageService.translate(key);
  }

  async ngOnInit() {
    const user = await this.userStorage.get('user');
    if (user) {
      this.userId = user.id;
    }

    // Abonnement "Paresseux" (Lazy) au store
    this.sub = this.store.select(state => state.userNotification?.Notification).subscribe(notifications => {
      if (notifications) {
        // RADICAL : Si on a déjà des notifications et que le nombre est le même, ON NE TOUCHE À RIEN.
        // On suppose que c'est juste une mise à jour de statut qu'on gère déjà localement.
        // Seul un changement de nombre (nouvelle notif ou suppression) déclenchera un re-rendu de la liste.
        if (this.notifications.length > 0 && notifications.length === this.notifications.length) {
          this.updateUnreadCount(notifications); // On met juste à jour le compteur global
          return;
        }

        this.notifications = [...notifications].map(n => ({
          ...n,
          body: n.body || n.message || '',
          createdAt: n.createdAt || n.date || new Date().toISOString()
        })).sort((a, b) => {
          const dateB = new Date(b.createdAt).getTime();
          const dateA = new Date(a.createdAt).getTime();
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });

        this.updateUnreadCount(this.notifications);
        this.cdr.markForCheck();
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

  updateUnreadCount(currentList: any[]) {
    if (this.userId) {
      this.unreadNotifications = currentList.filter(n => !this.isRead(n)).length;
    }
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

    // 1. Mise à jour VISUELLE INSTANTANÉE (Aucun appel réseau/store pour l'UI)
    if (!this.isRead(notification)) {
      this.localReadStatus.add(notification.id); // On le marque lu localement
      this.unreadNotifications = Math.max(0, this.unreadNotifications - 1); // On décrémente le compteur
      this.cdr.detectChanges(); // On force juste la mise à jour visuelle (le point rouge disparaît)
    } else {
      return; // Déjà lu, on ne fait rien
    }

    // 2. Logique métier en arrière-plan (Silent)
    // On envoie au store et au socket mais on s'en fiche du retour car on a bloqué le rafraîchissement liste dans le subscribe
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
      case 'default':
        return 'notifications-outline';
    }
  }

  isRead(notification: any): boolean {
    // Vérifie d'abord notre set local instantané
    if (this.localReadStatus.has(notification.id)) return true;

    if (!this.userId) return true;
    const isReadArray = Array.isArray(notification.isRead) ? notification.isRead : [];
    return isReadArray.includes(this.userId);
  }

  trackByNotificationId(index: number, notification: any) {
    return notification.id;
  }
}
