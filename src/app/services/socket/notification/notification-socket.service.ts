import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/indx';
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
            console.log('🔔 Notification lue :', data);
            if (this.notificationData.getNotification() !== null) {
                this.store.dispatch(markNotificationAsReadReducer({ notificationId, userId }));
            }
        });

        socket.on('newNotification', (data: any) => {
            console.log('🔔 Nouvelle notification reçue :', data);
            this.store.dispatch(addNotificationReducer({ Notification: data }));
        });
    }
}
