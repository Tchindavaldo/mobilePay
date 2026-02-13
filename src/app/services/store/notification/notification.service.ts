import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../indx';

@Injectable({
  providedIn: 'root'
})
export class NotificationStoreService {

  constructor(private store: Store<AppState>) { }

  // Sélecteurs pour accéder aux données du store
  getNotifications(): Observable<any[]> {
    return this.store.select(state => state.userNotification?.Notification || []);
  }

  // Méthodes utilitaires pour les notifications

  // Obtenir une notification par ID
  getNotificationById(id: string): Observable<any | undefined> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.find((notification: any) => notification.id === id);
      }
      return undefined;
    });
  }

  // Obtenir les notifications par type
  getNotificationsByType(type: string): Observable<any[]> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.filter((notification: any) => notification.type === type);
      }
      return [];
    });
  }

  // Obtenir les notifications non lues
  getUnreadNotifications(): Observable<any[]> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.filter((notification: any) => !notification.read);
      }
      return [];
    });
  }

  // Obtenir les notifications lues
  getReadNotifications(): Observable<any[]> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.filter((notification: any) => notification.read);
      }
      return [];
    });
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(): Observable<number> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.filter((notification: any) => !notification.read).length;
      }
      return 0;
    });
  }

  // Obtenir le nombre total de notifications
  getNotificationCount(): Observable<number> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.length;
      }
      return 0;
    });
  }

  // Vérifier si des notifications existent
  hasNotifications(): Observable<boolean> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.length > 0;
      }
      return false;
    });
  }

  // Vérifier s'il y a des notifications non lues
  hasUnreadNotifications(): Observable<boolean> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.some((notification: any) => !notification.read);
      }
      return false;
    });
  }

  // Obtenir les notifications récentes (dernières N notifications)
  getRecentNotifications(limit: number = 10): Observable<any[]> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return [...notifs]
          .sort((a: any, b: any) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime())
          .slice(0, limit);
      }
      return [];
    });
  }

  // Obtenir les notifications par priorité
  getNotificationsByPriority(priority: 'low' | 'medium' | 'high'): Observable<any[]> {
    return this.store.select(state => {
      const notifs = state.userNotification?.Notification;
      if (Array.isArray(notifs)) {
        return notifs.filter((notification: any) => notification.priority === priority);
      }
      return [];
    });
  }

  // Note: Les actions pour modifier le store dépendent de la structure du NotificationReducer
  // qui n'est pas visible dans les fichiers fournis. Ces méthodes devront être ajoutées
  // une fois que nous aurons accès au reducer des notifications.
}
