import axios from 'axios';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { setNotificationReducer } from 'src/app/services/store/notification/notification-reducer';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

@Injectable({ providedIn: 'root' })
export class GetUserNotificationService {
    private apiUrl = environment.apiUrl;
    constructor(private store: Store, private userStorage: UserStorageService) { }

    async getNotification(): Promise<void> {
        try {
            const user = await this.userStorage.get('user');
            if (!user || (!user.uid && !user.id)) return;

            const userId = user._id || user.id || user.uid;
            const endpoint = user.fastFoodId !== undefined ? `/user?userId=${userId}&fastFoodId=${user.fastFoodId}` : `/user?userId=${userId}`;

            const response = await axios.get(`${this.apiUrl}/api/notification${endpoint}`);

            console.log('Notifications récupérées avec succès', response.data);
            if (response.data && response.data.data) {
                this.store.dispatch(setNotificationReducer({ NotificationTab: response.data.data }));
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération des notifications:', error);
            if (error.response) {
                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
            } else if (error.request) {
                console.error('Request:', error.request);
            } else {
                console.error('Message:', error.message);
            }
        }
    }
}
