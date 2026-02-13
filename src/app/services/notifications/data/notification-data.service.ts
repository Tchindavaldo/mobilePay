import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app-state.interface';

@Injectable({
    providedIn: 'root',
})
export class NotificationDataService {
    private notification: any[] | null = null;

    constructor(private store: Store<AppState>) {
        this.store.select(state => state.userNotification?.Notification).subscribe(notif => {
            this.notification = notif;
        });
    }

    getNotification = () => this.notification;
}
