import { PlanActivationState } from './plan-activation/plan-activation-reducer';

export interface AppState {
    bonus: any;
    planActivation: PlanActivationState;
    transaction: any;
    userNotification: any;
}
