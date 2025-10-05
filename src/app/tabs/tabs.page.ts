import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  selectedTab: string = 'tab1';

  constructor(private router: Router) {}

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
}
