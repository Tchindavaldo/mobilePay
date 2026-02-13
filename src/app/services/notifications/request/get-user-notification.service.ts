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
            if (!user) return;

            const userId = user.uid || user.id;
            if (!userId) return;

            // Alignement avec le backend MoobilPay : On utilise /api/notification/user?userId=...
            // Retrait définitif de toute référence à fastFoodId ici aussi
            const response = await axios.get(`${this.apiUrl}/api/notification/user`, {
                params: { userId }
            });

            console.log('✅ [NOTIFICATION] Récupérées avec succès :', response.data);

            if (response.data && response.data.success && response.data.data) {
                // On dispatch dans le store pour mettre à jour l'UI instantanément
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
