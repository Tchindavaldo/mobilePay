import { Component } from '@angular/core';

interface SubscriptionItem {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  nextBillingDate?: string;
}

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
})
export class SubscriptionsComponent {
  subscriptions: SubscriptionItem[] = [
    {
      id: 'netflix',
      name: 'Netflix',
      status: 'active',
      nextBillingDate: '—'
    }
  ];

  goBack(): void {
    window.history.back();
  }
}
