import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app-state.interface';
import { UserStorageService } from '../../storage/user-storage.service';
import { UpdateUserService } from '../../user/requests/update-user.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Router } from '@angular/router';
import { addNotificationReducer } from '../../store/notification/notification-reducer';
import { SocketService } from '../../socket/socket.service';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class FcmService {
    constructor(
        private updateUserService: UpdateUserService,
        private store: Store<AppState>,
        private userStorage: UserStorageService,
        private router: Router,
        private socketService: SocketService
    ) { }

    private isConfigured = false;

    async setupPushNotifications() {
        // 1. Récupérer un token non envoyé et tenter de l'envoyer au backend
        // On fait ça AVANT le guard isConfigured car on veut pouvoir retenter l'envoi même si l'init est déjà faite
        const unsentToken = await this.userStorage.get('unsentFcmToken');
        if (unsentToken) {
            // console.log('🔄 [FCM] Token non envoyé trouvé dans le stockage local. Tentative de synchronisation...');
            try {
                const user = await this.userStorage.get('user');
                if (user?.id) {
                    await this.sendTokenToBackend(unsentToken);
                    await this.userStorage.remove('unsentFcmToken');
                    // console.log('✅ [FCM] Token en attente synchronisé avec succès');
                } else {
                    // console.log('⏳ [FCM] Token trouvé mais l\'utilisateur n\'est toujours pas connecté. En attente...');
                }
            } catch (e) {
                console.warn('⚠️ [FCM] Échec du renvoi du token FCM stocké localement:', e);
            }
        }

        if (!this.isConfigured) {
            console.log('📡 [FCM] Configuration initiale...');

            // Créer le channel pour Android IMMÉDIATEMENT (seulement sur Android)
            if (Capacitor.getPlatform() === 'android') {
                LocalNotifications.createChannel({
                    id: 'moobilpay_channel_v2', // On passe en V2 pour forcer la réactivation du son
                    name: 'Notifications MoobilPay',
                    importance: 5, // IMPORTANCE_HIGH (Obligatoire pour le son/popup)
                    sound: 'default', // Son par défaut du système
                    vibration: true,
                    lights: true,
                    lightColor: '#dc2626',
                    visibility: 1 // VISIBILITY_PUBLIC
                }).then(() => console.log('✅ [FCM] Channel "moobilpay_channel_v2" créé (SON ACTIVÉ)'))
                    .catch(err => console.error('❌ [FCM] Erreur création channel:', err));
            }

            this.setupListeners();
            this.isConfigured = true;
        }

        // 2. Demander la permission et enregistrer l'appareil
        // On le fait à chaque appel (notamment après login) pour s'assurer que le token est à jour
        try {
            const permissionStatus = await PushNotifications.requestPermissions();
            if (permissionStatus.receive === 'granted') {
                // console.log('📲 [FCM] Enregistrement de l\'appareil pour les notifications push...');
                await PushNotifications.register();
            } else {
                console.warn('🚫 [FCM] Permission pour les notifications push refusée');
            }
        } catch (error) {
            console.error('❌ [FCM] Erreur lors de l\'enregistrement:', error);
        }
    }

    private setupListeners() {
        // 4. Écran de "registration" (Récupération du Token)
        PushNotifications.addListener('registration', async token => {
            // console.log('📱 [FCM] Token reçu (registration event):', token.value);

            // Récupérer l'utilisateur actuel pour voir si on doit envoyer le token
            const user = await this.userStorage.get('user');
            const existingToken = user?.fcmToken;

            // Si le token a changé ou s'il n'est pas encore stocké au backend pour cet utilisateur
            if (!existingToken || token.value !== existingToken) {
                this.sendTokenToBackend(token.value);
            } else {
                // console.log('ℹ️ [FCM] Le token est identique à celui déjà stocké localement.');
            }
        });

        // 5. Gérer les notifications reçues quand l'app est au PREMIER PLAN
        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log('🔔 [FCM] Notification Reçue au premier plan:', notification);

            const data = notification.data || {};
            const persistentId = data.id || notification.id || Date.now().toString();

            // Préparer l'objet pour le store
            const notificationToStore = {
                ...data,
                id: persistentId,
                title: notification.title || data.title || 'Notification',
                body: notification.body || data.body || data.message || 'Nouveau message',
                createdAt: data.createdAt || new Date().toISOString()
            };

            // Mettre à jour le Store local
            this.store.dispatch(addNotificationReducer({ Notification: notificationToStore }));

            // Afficher une notification locale pour forcer le "heads-up"
            const internalId = Math.floor(Math.random() * 100000);
            LocalNotifications.schedule({
                notifications: [
                    {
                        id: internalId,
                        title: notificationToStore.title,
                        body: notificationToStore.body,
                        schedule: { at: new Date(Date.now() + 100) },
                        channelId: 'moobilpay_channel_v2',
                        sound: 'default',
                        smallIcon: 'ic_notification',
                        iconColor: '#dc2626',
                        extra: notificationToStore // On passe l'objet complet avec l'ID persistant
                    },
                ],
            });
        });

        // 6. Gérer les actions (clic) sur notification Push
        PushNotifications.addListener('pushNotificationActionPerformed', async action => {
            // console.log('🔔 [FCM] Notification Clicked! Data:', action.notification.data);

            const data = action.notification.data || {};
            const notification = action.notification;

            const notificationToStore = {
                ...data,
                id: data.id || notification.id || Date.now().toString(),
                title: notification.title || data.title || 'Notification',
                body: notification.body || data.body || data.message || 'Nouveau message',
                createdAt: data.createdAt || new Date().toISOString()
            };

            this.store.dispatch(addNotificationReducer({ Notification: notificationToStore }));

            // Marquer comme lu
            this.markAsReadOptimistic(notificationToStore);

            // Rediriger vers l'onglet des notifications (Tab 2)
            // console.log('🔔 [FCM] Navigating to /tabs/tab2...');
            await this.router.navigateByUrl('/tabs/tab2');
            // console.log('🔔 [FCM] Navigation trigger finished.');
        });

        // 7. Gérer les actions sur notification Locale
        LocalNotifications.addListener('localNotificationActionPerformed', async event => {
            // console.log('👆 Action sur notification locale:', event);

            const data = event.notification.extra || {};
            const notification = event.notification;

            const notificationToStore = {
                ...data,
                id: data.id || notification.id || Date.now().toString(),
                title: notification.title || data.title || 'Notification',
                body: notification.body || data.body || data.message || 'Nouveau message',
                createdAt: data.createdAt || new Date().toISOString()
            };

            this.store.dispatch(addNotificationReducer({ Notification: notificationToStore }));

            // Marquer comme lu
            this.markAsReadOptimistic(notificationToStore);

            // Rediriger vers l'onglet des notifications (Tab 2)
            await this.router.navigateByUrl('/tabs/tab2');
        });

        // Créer le channel pour Android
        LocalNotifications.createChannel({
            id: 'moobilpay_channel_v2',
            name: 'Notifications MoobilPay',
            importance: 5,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#dc2626',
            visibility: 1
        });
    }

    private async markAsReadOptimistic(notification: any) {
        const user = await this.userStorage.get('user');
        const userId = user?.id;

        if (userId) {
            this.socketService.getSocket().emit('isReadNotification', {
                userId: userId,
                notificationId: notification.id,
                notificationIdGroup: notification.idGroup
            });
        }
    }

    // Envoi du token FCM au backend via UpdateUserService
    async sendTokenToBackend(token: string) {
        try {
            // console.log('🔄 [FCM] Tentative d\'envoi du token FCM au backend:', token);
            const user = await this.userStorage.get('user');
            const userId = user?.id;

            if (userId) {
                // console.log(`📤 [FCM] Envoi du token pour userId: ${userId}`);
                await this.updateUserService.updateUser(userId, { fcmToken: token });
                // console.log('✅ [FCM] Token FCM envoyé avec succès au backend');

                // Mettre à jour le stockage local
                await this.userStorage.set('user', { ...user, fcmToken: token });
                // Supprimer le token non envoyé si c'était celui-là
                await this.userStorage.remove('unsentFcmToken');
            } else {
                console.warn('⚠️ [FCM] Impossible d\'envoyer le token : Utilisateur non identifié localement (userId manquant)');
                await this.userStorage.set('unsentFcmToken', token);
            }
        } catch (error) {
            console.error("❌ [FCM] Erreur d'envoi du token FCM au backend:", error);
            await this.userStorage.set('unsentFcmToken', token);
        }
    }
}
