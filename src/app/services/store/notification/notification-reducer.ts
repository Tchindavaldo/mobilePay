import { createAction, createReducer, on, props } from '@ngrx/store';

/* --- State initial --- */
const initialNotificationState = {
  Notification: null as any[] | null,
};

/* --- Actions --- */
export const addNotificationReducer = createAction('[Notification] Add', props<{ Notification: any }>());

export const setNotificationReducer = createAction('[Notification] Set', props<{ NotificationTab: any[] | null }>());

export const markNotificationAsReadReducer = createAction('[Notification] Mark As Read', props<{ notificationId: any; userId: any }>());

/* --- Reducer --- */
export const NotificationReducer = createReducer(
  initialNotificationState,

  on(setNotificationReducer, (state, { NotificationTab }) => ({
    Notification: NotificationTab,
  })),

  on(addNotificationReducer, (state, { Notification }) => {
    // Si la liste n'a pas encore été chargée (null), on n'ajoute rien.
    // L'utilisateur chargera la liste complète (y compris cette nouvelle notif) quand il ira sur la page.
    if (!state.Notification) return state;

    const notificationExists = state.Notification.some(notif => notif.id === Notification.id);
    if (!notificationExists) return { Notification: [Notification, ...state.Notification] };
    return state;
  }),

  on(markNotificationAsReadReducer, (state, { notificationId, userId }) => {
    if (!state.Notification) return state;

    let changed = false;
    const updatedNotifications = state.Notification.map(notif => {
      // Comparaison flexible des IDs (string/number)
      if (String(notif.id) === String(notificationId)) {
        const isReadArray = Array.isArray(notif.isRead) ? notif.isRead : [];
        if (!isReadArray.includes(userId)) {
          changed = true;
          return { ...notif, isRead: [...isReadArray, userId] };
        }
      }
      return notif;
    });

    return changed ? { ...state, Notification: updatedNotifications } : state;
  })
);
