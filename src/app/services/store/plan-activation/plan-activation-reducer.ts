import { createAction, createReducer, on, props } from '@ngrx/store';

/* --- Interface pour Plan Activation --- */
export interface PlanActivation {
  id: string;
  userId: string;
  planType: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  activationDate: string;
  expirationDate: string;
  paymentId?: string;
  netflixEmail?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Pour permettre d'autres propriétés
}

/* --- State initial --- */
const initialPlanActivationState = {
  planActivations: null as PlanActivation[] | null,
  loading: false,
  error: null as string | null
};

export type PlanActivationState = typeof initialPlanActivationState;

/* --- Actions --- */

// Action pour initialiser la liste des activations
export const initPlanActivationsReducer = createAction(
  '[PlanActivation] Init',
  props<{ planActivations: PlanActivation[] | null }>()
);

// Action pour ajouter une nouvelle activation
export const addPlanActivationReducer = createAction(
  '[PlanActivation] Add',
  props<{ planActivation: PlanActivation }>()
);

// Action pour modifier une activation existante
export const updatePlanActivationReducer = createAction(
  '[PlanActivation] Update',
  props<{ id: string; updates: Partial<PlanActivation> }>()
);

// Action pour supprimer une activation
export const removePlanActivationReducer = createAction(
  '[PlanActivation] Remove',
  props<{ id: string }>()
);

// Actions pour gérer le loading et les erreurs
export const setPlanActivationLoadingReducer = createAction(
  '[PlanActivation] Set Loading',
  props<{ loading: boolean }>()
);

export const setPlanActivationErrorReducer = createAction(
  '[PlanActivation] Set Error',
  props<{ error: string | null }>()
);

/* --- Reducer --- */
export const planActivationReducer = createReducer(
  initialPlanActivationState,

  // Initialiser les activations
  on(initPlanActivationsReducer, (state, { planActivations }) => ({
    ...state,
    planActivations,
    loading: false,
    error: null
  })),

  // Ajouter une nouvelle activation
  on(addPlanActivationReducer, (state, { planActivation }) => {
    // Si la liste n'a pas encore été chargée (null), on n'ajoute rien.
    if (!state.planActivations) return state;

    // Vérifier si l'activation existe déjà
    const activationExists = state.planActivations.some(activation => activation.id === planActivation.id);
    if (!activationExists) {
      return {
        ...state,
        planActivations: [planActivation, ...state.planActivations],
        loading: false,
        error: null
      };
    }

    return state;
  }),

  // Modifier une activation existante
  on(updatePlanActivationReducer, (state, { id, updates }) => {
    if (!state.planActivations) {
      return state;
    }

    const updatedPlanActivations = state.planActivations.map(activation => {
      if (activation.id === id) {
        // Fusionner les mises à jour avec l'activation existante
        // Ne modifier que les champs différents
        const updatedActivation = { ...activation };

        // Parcourir les mises à jour et ne modifier que les champs différents
        Object.keys(updates).forEach(key => {
          if (updates[key] !== activation[key]) {
            updatedActivation[key] = updates[key];
          }
        });

        // Mettre à jour le timestamp de modification
        updatedActivation.updatedAt = new Date().toISOString();

        return updatedActivation;
      }
      return activation;
    });

    return {
      ...state,
      planActivations: updatedPlanActivations,
      loading: false,
      error: null
    };
  }),

  // Supprimer une activation
  on(removePlanActivationReducer, (state, { id }) => {
    if (!state.planActivations) {
      return state;
    }

    const filteredPlanActivations = state.planActivations.filter(activation => activation.id !== id);

    return {
      ...state,
      planActivations: filteredPlanActivations,
      loading: false,
      error: null
    };
  }),

  // Gérer le loading
  on(setPlanActivationLoadingReducer, (state, { loading }) => ({
    ...state,
    loading
  })),

  // Gérer les erreurs
  on(setPlanActivationErrorReducer, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);
