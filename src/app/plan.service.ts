import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanService {


  private selectedPlanSubject = new BehaviorSubject<{ plan: string, price: string }>({ plan: 'aucun', price: '0' });
  selectedPlan$ = this.selectedPlanSubject.asObservable();

  constructor() {
    // Récupérer les données du Local Storage lors de l'initialisation du service
    const storedPlan = localStorage.getItem('selectedPlan');
    const storedPrice = localStorage.getItem('selectedPrice');
    if (storedPlan && storedPrice) {
      this.selectedPlanSubject.next({ plan: storedPlan, price: storedPrice });
    }
  }

  updateSelectedPlan(plan: string, price: string) {
    // Mettre à jour le BehaviorSubject
    this.selectedPlanSubject.next({ plan, price });

    // Stocker les données dans le Local Storage
    localStorage.setItem('selectedPlan', plan);
    localStorage.setItem('selectedPrice', price);
  }


  resetPlan() {
    // Réinitialiser le plan et le prix
    this.selectedPlanSubject.next({ plan: 'aucun', price: '0' });

    // Mettre à jour le Local Storage
    localStorage.setItem('selectedPlan', 'aucun');
    localStorage.setItem('selectedPrice', '0');
  }
}
