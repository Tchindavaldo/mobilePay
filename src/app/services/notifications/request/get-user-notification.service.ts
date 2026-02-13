import axios from 'axios';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { setNotificationReducer } from '../../store/notification/notification-reducer';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';

@Injectable({ providedIn: 'root' })
export class GetUserNotificationService {
    private apiUrl = environment.apiUrl;
    constructor(private store: Store, private userStorage: UserStorageService) { }

    async getNotification(): Promise<void> {
        try {
            const user = await this.userStorage.get('user');
            if (!user || (!user.uid && !user.id)) return;

            const userId = String(user.id);
            const endpoint = user.fastFoodId !== undefined ? `/user?userId=${userId}&fastFoodId=${user.fastFoodId}` : `/user?userId=${userId}`;
            const fullUrl = `${this.apiUrl}/api/notification${endpoint}`;

            console.log('📡 [NOTIFICATION] Calling:', fullUrl);
            const response = await axios.get(fullUrl, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            console.log('✅ [NOTIFICATION] Récupérées avec succès :', response.data);

            if (response.data && response.data.data) {
                // On dispatch dans le store pour mettre à jour l'UI instantanément
                this.store.dispatch(setNotificationReducer({ NotificationTab: response.data.data }));
            }
        } catch (error: any) {
            console.error('❌ [NOTIFICATION] Erreur complète:', JSON.stringify(error, null, 2));
            if (error.response) {
                console.error('📡 [NOTIFICATION] Erreur Data:', JSON.stringify(error.response.data, null, 2));
                console.error('📡 [NOTIFICATION] Erreur Status:', error.response.status);
            }
            throw error;
        }
    }
}
