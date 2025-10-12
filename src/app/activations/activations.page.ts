import { Component, OnInit } from '@angular/core';

interface Activation {
  id: string;
  plan: string;
  email: string;
  date: string;
  amount: string;
  status: 'active' | 'pending';
  estimatedTime?: string;
}

@Component({
  selector: 'app-activations',
  templateUrl: './activations.page.html',
  styleUrls: ['./activations.page.scss'],
})
export class ActivationsPage implements OnInit {

  notificationCount: number = 0;
  searchTerm: string = '';
  activations: Activation[] = [];
  filteredActivations: Activation[] = [];

  constructor() { }

  ngOnInit() {
    this.loadActivations();
  }

  loadActivations() {
    // Données de démonstration - à remplacer par un appel API
    this.activations = [
      {
        id: '1',
        plan: 'Netflix Premium',
        email: 'user@example.com',
        date: '10 Oct 2025',
        amount: '13,99€',
        status: 'active'
      },
      {
        id: '2',
        plan: 'Netflix Standard',
        email: 'user2@example.com',
        date: '09 Oct 2025',
        amount: '10,99€',
        status: 'pending',
        estimatedTime: '15-45 min'
      },
      {
        id: '3',
        plan: 'Netflix Basic',
        email: 'user3@example.com',
        date: '08 Oct 2025',
        amount: '7,99€',
        status: 'active'
      },
      {
        id: '4',
        plan: 'Netflix Premium',
        email: 'user4@example.com',
        date: '07 Oct 2025',
        amount: '13,99€',
        status: 'pending',
        estimatedTime: '30-60 min'
      }
    ];
    
    this.filteredActivations = [...this.activations];
  }

  filterActivations() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredActivations = [...this.activations];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredActivations = this.activations.filter(activation =>
      activation.plan.toLowerCase().includes(term) ||
      activation.email.toLowerCase().includes(term) ||
      activation.date.toLowerCase().includes(term)
    );
  }

  getTotalActivations(): number {
    return this.activations.length;
  }

  getActiveCount(): number {
    return this.activations.filter(a => a.status === 'active').length;
  }

  getPendingCount(): number {
    return this.activations.filter(a => a.status === 'pending').length;
  }

  getTotalSpent(): number {
    // Calculer le total dépensé en extrayant les montants
    return this.activations.reduce((total, activation) => {
      const amount = parseFloat(activation.amount.replace('€', '').replace(',', '.'));
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  }

  viewActivationDetails(activation: Activation) {
    // TODO: Implémenter la navigation vers les détails de l'activation
    console.log('Détails activation:', activation);
  }

}
