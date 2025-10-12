import { createAction, createReducer, on, props } from '@ngrx/store';

/* --- State initial --- */
const initialTransactionState = {
  Transaction: null as null | any[],
  totalAmount: 0,
};

/* --- Actions --- */
// Action pour ajouter une transaction
export const addTransactionReducer = createAction('[Transaction] Add', props<{ Transaction: any }>());

// Action pour initialiser les transactions
export const initTransactionReducer = createAction('[Transaction] Init', props<{ transactions: any[] | null }>());

// Action pour initialiser le montant total
export const initTotalAmountReducer = createAction('[Transaction] Init Total Amount', props<{ amount: number }>());

// Action pour mettre à jour le montant total
export const updateTotalAmountReducer = createAction('[Transaction] Update Total Amount', props<{ amount: number }>());

// Action pour calculer le montant dépensé
export const getSpendAmountReducer = createAction('[Transaction] Get Spend Amount', props<{ date: Date; transactions: any[] }>());

/* --- Reducer --- */
export const TransactionReducer = createReducer(
  initialTransactionState,

  // Initialiser les transactions
  on(initTransactionReducer, (state, { transactions }) => ({ ...state, Transaction: transactions })),

  // Initialiser le montant total
  on(initTotalAmountReducer, (state, { amount }) => ({ ...state, totalAmount: amount })),

  // Mettre à jour le montant total
  on(updateTotalAmountReducer, (state, { amount }) => ({ ...state, totalAmount: state.totalAmount + amount })),

  // Ajouter une transaction
  on(addTransactionReducer, (state, { Transaction }) => {
    let newTransactions;

    if (!state.Transaction) {
      newTransactions = [Transaction];
    } else {
      const transactionExists = state.Transaction.some(trans => trans.id === Transaction.id);
      if (!transactionExists) {
        newTransactions = [Transaction, ...state.Transaction];
      } else {
        return state;
      }
    }

    return { ...state, Transaction: newTransactions };
  })
);
