import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../indx';
import { 
  addTransactionReducer, 
  initTransactionReducer, 
  initTotalAmountReducer, 
  updateTotalAmountReducer, 
  getSpendAmountReducer 
} from './transaction-reducer';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private store: Store<AppState>) {}

  // Sélecteurs pour accéder aux données du store
  getTransactions(): Observable<any[] | null> {
    return this.store.select(state => state.transaction.Transaction);
  }

  getTotalAmount(): Observable<number> {
    return this.store.select(state => state.transaction.totalAmount);
  }

  // Actions pour modifier le store

  // Initialiser les transactions
  initTransactions(transactions: any[] | null): void {
    this.store.dispatch(initTransactionReducer({ transactions }));
  }

  // Ajouter une nouvelle transaction
  addTransaction(transaction: any): void {
    this.store.dispatch(addTransactionReducer({ Transaction: transaction }));
  }

  // Initialiser le montant total
  initTotalAmount(amount: number): void {
    this.store.dispatch(initTotalAmountReducer({ amount }));
  }

  // Mettre à jour le montant total
  updateTotalAmount(amount: number): void {
    this.store.dispatch(updateTotalAmountReducer({ amount }));
  }

  // Calculer le montant dépensé
  getSpendAmount(date: Date, transactions: any[]): void {
    this.store.dispatch(getSpendAmountReducer({ date, transactions }));
  }

  // Méthodes utilitaires

  // Obtenir une transaction par ID
  getTransactionById(id: string): Observable<any | undefined> {
    return this.store.select(state => 
      state.transaction.Transaction?.find(transaction => transaction.id === id)
    );
  }

  // Obtenir les transactions par type
  getTransactionsByType(type: string): Observable<any[]> {
    return this.store.select(state => 
      state.transaction.Transaction?.filter(transaction => transaction.type === type) || []
    );
  }

  // Obtenir les transactions par statut
  getTransactionsByStatus(status: string): Observable<any[]> {
    return this.store.select(state => 
      state.transaction.Transaction?.filter(transaction => transaction.status === status) || []
    );
  }

  // Obtenir les transactions d'une période
  getTransactionsByDateRange(startDate: Date, endDate: Date): Observable<any[]> {
    return this.store.select(state => 
      state.transaction.Transaction?.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      }) || []
    );
  }

  // Obtenir les transactions d'aujourd'hui
  getTodayTransactions(): Observable<any[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getTransactionsByDateRange(startOfDay, endOfDay);
  }

  // Obtenir le nombre total de transactions
  getTransactionCount(): Observable<number> {
    return this.store.select(state => 
      state.transaction.Transaction?.length || 0
    );
  }

  // Vérifier si des transactions existent
  hasTransactions(): Observable<boolean> {
    return this.store.select(state => 
      state.transaction.Transaction !== null && state.transaction.Transaction.length > 0
    );
  }

  // Calculer le montant total des transactions
  calculateTotalTransactionAmount(): Observable<number> {
    return this.store.select(state => 
      state.transaction.Transaction?.reduce((total, transaction) => 
        total + (transaction.amount || 0), 0) || 0
    );
  }

  // Obtenir les transactions récentes (dernières N transactions)
  getRecentTransactions(limit: number = 10): Observable<any[]> {
    return this.store.select(state => 
      state.transaction.Transaction?.slice(0, limit) || []
    );
  }
}
