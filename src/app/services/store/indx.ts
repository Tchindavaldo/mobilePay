// src/app/store/reducers/index.ts

import { ActionReducerMap } from '@ngrx/store';
import { bonusReducer } from './bonus/bonus-reducer';
import { planActivationReducer, PlanActivationState } from './plan-activation/plan-activation-reducer';
import { TransactionReducer } from './transaction/transaction-reducer';
import { NotificationReducer } from './notification/notification-reducer';

export interface AppState {
  bonus: any;
  planActivation: PlanActivationState;
  transaction: any;
  userNotification: any;
}

export const reducers: ActionReducerMap<AppState> = {
  bonus: bonusReducer,
  planActivation: planActivationReducer,
  transaction: TransactionReducer,
  userNotification: NotificationReducer,
};
