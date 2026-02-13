import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SocketService } from '../services/socket/socket.service';
import { LanguageService } from '../services/language.service';
import { FcmService } from '../services/notifications/FCM/fcm.service';
import { Store } from '@ngrx/store';
import { AppState } from '../services/store/indx';
import { UserStorageService } from '../services/storage/user-storage.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  selectedTab: string = 'tab1';
  unreadCount: number = 0;
  private userId: string | null = null;

  constructor(
    private router: Router,
    private platform: Platform,
    private socketService: SocketService,
    private fcmService: FcmService,
    public langService: LanguageService,
    private store: Store<AppState>,
    private userStorage: UserStorageService
  ) {
    // Initialiser les sockets et notifications après un court délai pour éviter de bloquer le rendu initial
    this.platform.ready().then(async () => {
      const user = await this.userStorage.get('user');
      if (user) {
        this.userId = user.uid || user.id;
      }

      setTimeout(() => {
        console.log('🚀 [DELAYED INIT] Initialisation des sockets et FCM...');
        this.socketService.initializeAllSockets();
        this.fcmService.setupPushNotifications();
      }, 2000);
    });
  }

  ngOnInit(): void {
    const url = this.router.url || '';
    const match = url.match(/\/tabs\/(tab\d)/);
    if (match && match[1]) {
      this.selectedTab = match[1];
    }

    // Suivre le compteur de notifications non lues
    this.store.select(state => state.userNotification?.Notification).subscribe(notifications => {
      if (notifications && this.userId) {
        this.unreadCount = notifications.filter((n: any) => {
          const isReadArray = Array.isArray(n.isRead) ? n.isRead :
            (typeof n.isRead === 'string' ? JSON.parse(n.isRead) : []);
          return !isReadArray.includes(this.userId);
        }).length;
      }
    });
  }

  onTabsDidChange(event: any) {
    this.selectedTab = event?.detail?.tab ?? this.selectedTab;
  }

  ionViewDidEnter() {
    // Force une recalcule du layout après l'entrée sur la page
    // Cela règle souvent les problèmes d'éléments qui ne prennent leur taille qu'après un refresh
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  t(key: string): string {
    return this.langService.translate(key);
  }
}
