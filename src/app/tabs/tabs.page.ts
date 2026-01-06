import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SocketService } from '../services/socket/socket.service';
import { LanguageService } from '../services/language.service';

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
    public langService: LanguageService
  ) {
    // Initialiser les sockets au démarrage de l'application
    this.platform.ready().then(() => {
      console.log('🚀 Platform ready - Initialisation des sockets...');
      this.socketService.initializeAllSockets();
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
