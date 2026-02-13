// src/app/store/reducers/index.ts

import { ActionReducerMap } from '@ngrx/store';
import { bonusReducer } from './bonus/bonus-reducer';
import { planActivationReducer } from './plan-activation/plan-activation-reducer';
import { TransactionReducer } from './transaction/transaction-reducer';
import { NotificationReducer } from './notification/notification-reducer';
import { AppState } from './app-state.interface';
export { AppState };

export const reducers: ActionReducerMap<AppState> = {
  bonus: bonusReducer,
  planActivation: planActivationReducer,
  // menu: MenuReducer,
  // userOrder: userOrderReducer,
  // fastFoodOrder: orderReducer,
  transaction: TransactionReducer,
  userNotification: NotificationReducer,
};
