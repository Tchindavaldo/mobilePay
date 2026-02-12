import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/indx';
import { UserStorageService } from '../../storage/user-storage.service';
import { UpdateUserService } from '../../user/requests/update-user.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Router } from '@angular/router';
import { addNotificationReducer } from '../../store/notification/notification-reducer';

@Injectable({ providedIn: 'root' })
export class FcmService {
    constructor(
        private updateUserService: UpdateUserService,
        private store: Store<AppState>,
        private userStorage: UserStorageService,
        private router: Router
    ) { }

    async setupPushNotifications() {
        // 1. Récupérer un token non envoyé et tenter de l'envoyer au backend
        const unsentToken = await this.userStorage.get('unsentFcmToken');
        if (unsentToken) {
            try {
                await this.sendTokenToBackend(unsentToken);
                await this.userStorage.remove('unsentFcmToken');
            } catch (e) {
                console.warn('⚠️ Échec du renvoi du token FCM stocké localement:', e);
            }
        }

        // 2. Demander la permission pour les notifications
        try {
            const permissionStatus = await PushNotifications.requestPermissions();
            if (permissionStatus.receive === 'granted') {
                // Enregistrer l'appareil pour recevoir des notifications push
                await PushNotifications.register();
            } else {
                console.warn('🚫 Permission pour les notifications push refusée');
                return;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la demande de permission:', error);
            return;
        }

        // 3. Vérifier si un token FCM existe déjà pour l'utilisateur
        const user = await this.userStorage.get('user');
        const existingToken = user?.fcmToken;

        // 4. Écran de "registration" (Récupération du Token)
        PushNotifications.addListener('registration', token => {
            console.log('📱 Token FCM enregistré (registration):', token.value);

            // Si le token a changé ou s'il n'est pas encore stocké, l'envoyer au backend
            if (!existingToken || token.value !== existingToken) {
                this.sendTokenToBackend(token.value);
            }
        });

        // 5. Gérer les notifications reçues quand l'app est au PREMIER PLAN
        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log('🔔 Notification push reçue:', notification);

            const data = notification.data;
            if (data) {
                // Mettre à jour le Store local
                this.store.dispatch(addNotificationReducer({ Notification: data }));
            }

            // Afficher une notification locale pour forcer le "heads-up"
            const notificationId = Math.floor(Math.random() * 100000);
            LocalNotifications.schedule({
                notifications: [
                    {
                        id: notificationId,
                        title: notification.title || 'Notification',
                        body: notification.body || 'Nouveau message',
                        schedule: { at: new Date(Date.now() + 100) },
                        channelId: 'high_priority_channel',
                        sound: 'default',
                        smallIcon: 'ic_launcher',
                        extra: data
                    },
                ],
            });
        });

        // 6. Gérer les actions (clic) sur notification Push
        PushNotifications.addListener('pushNotificationActionPerformed', action => {
            console.log('👆 Action de notification Push:', action);
            const data = action.notification.data;
            if (data) {
                this.store.dispatch(addNotificationReducer({ Notification: data }));
            }
            this.router.navigateByUrl('/tabs/tab4'); // Ou l'onglet des notifications
        });

        // 7. Gérer les actions sur notification Locale
        LocalNotifications.addListener('localNotificationActionPerformed', event => {
            console.log('👆 Action sur notification locale:', event);
            const data = event.notification.extra;
            if (data) {
                this.store.dispatch(addNotificationReducer({ Notification: data }));
            }
            this.router.navigateByUrl('/tabs/tab4');
        });

        // Créer le channel pour Android
        LocalNotifications.createChannel({
            id: 'high_priority_channel',
            name: 'Notifications Importantes',
            importance: 5,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#ff0000'
        });
    }

    // Envoi du token FCM au backend via UpdateUserService
    async sendTokenToBackend(token: string) {
        try {
            console.log('🔄 Tentative d\'envoi du token FCM au backend:', token);
            const user = await this.userStorage.get('user');
            // Log pour debugger l'objet user
            console.log('👤 Utilisateur récupéré pour mise à jour FCM:', user);

            const userId = user?.id;

            if (userId) {
                console.log(`📤 Envoi du token pour userId: ${userId}`);
                await this.updateUserService.updateUser(userId, { fcmToken: token });
                console.log('✅ Token FCM envoyé avec succès au backend');

                // Mettre à jour le stockage local
                await this.userStorage.set('user', { ...user, fcmToken: token });
            } else {
                console.warn('⚠️ Impossible d\'envoyer le token : Utilisateur non identifié localement (userId manquant)');
                await this.userStorage.set('unsentFcmToken', token);
            }
        } catch (error) {
            console.error("❌ Erreur d'envoi du token FCM au backend (Détails):", JSON.stringify(error, null, 2));
            if (error instanceof Error) {
                console.error("❌ Message d'erreur:", error.message);
                console.error("❌ Stack trace:", error.stack);
            }
            // Essayer d'afficher la réponse serveur si disponible (cas Axios/Http)
            if ((error as any).error) {
                console.error("❌ Réponse serveur:", JSON.stringify((error as any).error, null, 2));
            }
            this.userStorage.set('unsentFcmToken', token);
        }
    }
}
