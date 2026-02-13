import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app-state.interface';
import { NotificationDataService } from '../../notifications/data/notification-data.service';
import { markNotificationAsReadReducer, addNotificationReducer } from '../../store/notification/notification-reducer';

@Injectable({
    providedIn: 'root',
})
export class NotificationSocketService {
    constructor(private notificationData: NotificationDataService, private store: Store<AppState>) { }

    public initializeSocket(socket: Socket) {
        socket.on('isRead', (data: any) => {
            const { notificationId, userId } = data;
            console.log('🔔 [Socket] Notification lue :', data);
            this.store.dispatch(markNotificationAsReadReducer({ notificationId, userId }));
        });

        socket.on('newNotification', (data: any) => {
            console.log('🔔 [Socket] Nouvelle notification reçue :', data);

            // Normalisation pour correspondre à FCM et éviter les doublons
            const notification = {
                ...data,
                id: data.id || data._id || Date.now().toString(),
                title: data.title || 'Notification',
                body: data.body || data.message || '',
                createdAt: data.createdAt || data.date || new Date().toISOString()
            };

            this.store.dispatch(addNotificationReducer({ Notification: notification }));
        });
    }
}
