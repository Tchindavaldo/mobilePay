import { createAction, createReducer, on, props } from '@ngrx/store';

/* --- State initial --- */
const initialBonusState = { bonus: null as any[] | null };

/* --- Actions --- */
export const addBonusReducer = createAction('[bonus] Add', props<{ bonus: any }>());
export const setBonusReducer = createAction('[bonus] set', props<{ bonusTab: any[] | null }>());

/* --- Reducer --- */
export const bonusReducer = createReducer(
  initialBonusState,
  on(setBonusReducer, (state, { bonusTab }) => ({ bonus: bonusTab })),
  on(addBonusReducer, (state, { bonus }) => ({ bonus: state.bonus ? [bonus, ...state.bonus] : [bonus] }))
);
