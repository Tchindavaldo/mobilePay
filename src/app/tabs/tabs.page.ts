import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SocketService } from '../services/socket/socket.service';
import { LanguageService } from '../services/language.service';
import { FcmService } from '../services/notifications/FCM/fcm.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  selectedTab: string = 'tab1';

  constructor(
    private router: Router,
    private platform: Platform,
    private socketService: SocketService,
    private fcmService: FcmService,
    public langService: LanguageService
  ) {
    // Initialiser les sockets et notifications au démarrage
    this.platform.ready().then(() => {
      console.log('🚀 Platform ready - Initialisation des sockets et FCM...');
      this.socketService.initializeAllSockets();
      this.fcmService.setupPushNotifications();
    });
  }

  ngOnInit(): void {
    const url = this.router.url || '';
    const match = url.match(/\/tabs\/(tab\d)/);
    if (match && match[1]) {
      this.selectedTab = match[1];
    }
  }

  onTabsDidChange(event: any) {
    this.selectedTab = event?.detail?.tab ?? this.selectedTab;
  }

  t(key: string): string {
    return this.langService.translate(key);
  }
}
