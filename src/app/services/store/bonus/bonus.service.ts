import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../indx';
import { addBonusReducer, setBonusReducer } from './bonus-reducer';

@Injectable({
  providedIn: 'root'
})
export class BonusService {

  constructor(private store: Store<AppState>) {}

  // Sélecteurs pour accéder aux données du store
  getBonus(): Observable<any[] | null> {
    return this.store.select(state => state.bonus.bonus);
  }

  // Actions pour modifier le store

  // Initialiser/définir la liste des bonus
  setBonus(bonusTab: any[] | null): void {
    this.store.dispatch(setBonusReducer({ bonusTab }));
  }

  // Ajouter un nouveau bonus
  addBonus(bonus: any): void {
    this.store.dispatch(addBonusReducer({ bonus }));
  }

  // Méthodes utilitaires

  // Obtenir un bonus par ID
  getBonusById(id: string): Observable<any | undefined> {
    return this.store.select(state => 
      state.bonus.bonus?.find((bonus: any) => bonus.id === id)
    );
  }

  // Obtenir les bonus par type
  getBonusByType(type: string): Observable<any[]> {
    return this.store.select(state => 
      state.bonus.bonus?.filter((bonus: any) => bonus.type === type) || []
    );
  }

  // Obtenir les bonus actifs
  getActiveBonus(): Observable<any[]> {
    return this.store.select(state => 
      state.bonus.bonus?.filter((bonus: any) => bonus.active === true) || []
    );
  }

  // Vérifier si des bonus existent
  hasBonus(): Observable<boolean> {
    return this.store.select(state => 
      state.bonus.bonus !== null && state.bonus.bonus.length > 0
    );
  }

  // Obtenir le nombre total de bonus
  getBonusCount(): Observable<number> {
    return this.store.select(state => 
      state.bonus.bonus?.length || 0
    );
  }
}
