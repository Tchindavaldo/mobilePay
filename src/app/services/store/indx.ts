// src/app/store/reducers/index.ts

import { ActionReducerMap } from '@ngrx/store';
import { bonusReducer } from './bonus/bonus-reducer';
import { planActivationReducer, PlanActivationState } from './plan-activation/plan-activation-reducer';

// import { MenuReducer } from './menu/menu-reducer';
// import { fastFoodReducer } from './fastFood/fastfoods-reducer';
// import { orderReducer } from './order/order-fastfood-reducer';
// import { userOrderReducer } from './order/order-user-reducer';
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
  // menu: MenuReducer,
  // userOrder: userOrderReducer,
  // fastFoodOrder: orderReducer,
  transaction: TransactionReducer,
  userNotification: NotificationReducer,
};
