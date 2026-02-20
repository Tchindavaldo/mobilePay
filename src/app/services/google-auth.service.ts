import { Injectable } from '@angular/core';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User, GoogleAuthProvider as FirebaseGoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { app } from '../../firebase-config';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { UserStorageService } from './storage/user-storage.service';
import { UserDataService } from './user/data/user-data.service';
import { GetUserService } from './user/requests/get-user.service';
import { CreateUserService, CreateUserDto } from './user/requests/create-user.service';
import { UpdateUserService, UpdateUserDto } from './user/requests/update-user.service';
import { AuthStateService } from './auth-state.service';
import { SocketService } from './socket/socket.service';
import { InitSessionSocketService } from './socket/init-session-socket.service';
import { FcmService } from './notifications/FCM/fcm.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private auth = getAuth(app);
  private provider = new GoogleAuthProvider();

  constructor(
    private authState: AuthStateService,
    private userStorage: UserStorageService,
    private userData: UserDataService,
    private getUserService: GetUserService,
    private createUserService: CreateUserService,
    private updateUserService: UpdateUserService,
    private socketService: SocketService,
    private sessionSocketService: InitSessionSocketService,
    private fcmService: FcmService
  ) {
    this.initializeSocialLogin();
    // Configurer le provider Google
    this.provider.addScope('email');
    this.provider.addScope('profile');
  }

  private async initializeSocialLogin() {
    if (Capacitor.isNativePlatform()) {
      try {
        await SocialLogin.initialize({
          google: {
            webClientId: '583417452577-elkimar69os44l6qgagqek2arurgmtbc.apps.googleusercontent.com',
            iOSClientId: '583417452577-1edun3m83ttsldhsaa2gvesmdj6fg2mt.apps.googleusercontent.com',
            mode: 'online'
          }
        });
        console.log('✓ SocialLogin initialisé');
      } catch (e) {
        console.error('Erreur initialisation SocialLogin:', e);
      }
    }
  }

  async signInWithGoogle(): Promise<User | null> {
    // Activer le flag pour bloquer les redirections automatiques
    this.authState.setGoogleLoginInProgress(true);

    try {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      let firebaseUser: User;

      // Utiliser le flux WEB sur iOS car le bridge natif Firebase bloque à l'étape 1.4
      if (isNative && platform !== 'ios') {
        console.log('📱 Authentification Google NATIVE (Android)...');
        const loginResult = await SocialLogin.login({
          provider: 'google',
          options: {}
        });

        console.log('✓ SocialLogin réussie. Résultat brut:', JSON.stringify(loginResult));
        const res = loginResult.result as any;
        const idToken = res.idToken;

        if (!idToken) throw new Error('ID Token manquant');

        const credential = FirebaseGoogleAuthProvider.credential(idToken);
        console.log('🔥 Firebase (Android) : Envoi du Credential...');
        const userCredential = await signInWithCredential(this.auth, credential);
        firebaseUser = userCredential.user;
      } else {
        // Flux WEB (Popup) pour iOS et Desktop
        console.log(platform === 'ios' ? '� iOS détecté : Utilisation du flux WEB (Popup) pour stabilité.' : '💻 Web détecté : Utilisation du flux Popup.');

        this.provider.setCustomParameters({
          prompt: 'select_account'
        });

        const result = await signInWithPopup(this.auth, this.provider);
        firebaseUser = result.user;
      }

      console.log('✓ [SUCCESS] Authentification Firebase terminée.');

      if (!firebaseUser || !firebaseUser.uid) {
        throw new Error('Aucune donnée utilisateur reçue de Firebase après authentification');
      }

      // ÉTAPE 2 : Vérifier si l'utilisateur existe dans la BD backend (par email)
      console.log('🔍 Étape 2/6 : Vérification de l\'utilisateur dans le backend...');
      const userEmail = firebaseUser.email;

      if (!userEmail) {
        throw new Error('Aucun email disponible pour cet utilisateur Google');
      }

      let backendUser;
      try {
        console.log(`📡 Appel API getUserByEmail pour: ${userEmail}`);
        backendUser = await this.getUserService.getUserByEmail(userEmail);
        console.log('📡 Réponse API getUserByEmail:', !!backendUser);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('❌ Erreur API Critique (Vérification email):', error);
          throw new Error('Le serveur ne répond pas. Veuillez vérifier votre connexion.');
        }
        console.log('ℹ️ Utilisateur inconnu dans le backend, il sera créé.');
        backendUser = null;
      }

      // Préparer TOUTES les données Google Auth pour création ou mise à jour
      const googleAuthData: CreateUserDto | UpdateUserDto = {
        // Identifiants principaux
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        phoneNumber: firebaseUser.phoneNumber || '',

        // Tokens d'authentification
        accessToken: (firebaseUser as any).stsTokenManager?.accessToken || (firebaseUser as any).accessToken,
        refreshToken: (firebaseUser as any).stsTokenManager?.refreshToken || (firebaseUser as any).refreshToken,
        expirationTime: (firebaseUser as any).stsTokenManager?.expirationTime,

        // Informations de vérification
        emailVerified: firebaseUser.emailVerified,
        isAnonymous: firebaseUser.isAnonymous,

        // Provider info
        providerId: firebaseUser.providerId,
        providerData: firebaseUser.providerData,

        // Métadonnées temporelles
        metadata: {
          createdAt: firebaseUser.metadata?.creationTime,
          lastLoginAt: firebaseUser.metadata?.lastSignInTime,
          lastSignInTime: firebaseUser.metadata?.lastSignInTime,
          creationTime: firebaseUser.metadata?.creationTime,
        },

        // Tenant
        tenantId: firebaseUser.tenantId,
      };

      console.log('📦 Données Google Auth complètes préparées:', {
        uid: googleAuthData.uid,
        email: googleAuthData.email,
        hasAccessToken: !!googleAuthData.accessToken,
        hasRefreshToken: !!googleAuthData.refreshToken,
        emailVerified: googleAuthData.emailVerified,
        providerId: googleAuthData.providerId,
      });

      // ÉTAPE 3 : Si l'utilisateur existe, le mettre à jour avec les données Google
      if (backendUser) {
        console.log('🔄 Étape 3/6 : Utilisateur trouvé - Mise à jour avec les données Google Auth...');

        const userId = backendUser.id || backendUser._id;
        if (!userId) {
          throw new Error('Impossible de récupérer l\'ID de l\'utilisateur existant');
        }

        try {
          backendUser = await this.updateUserService.updateUser(userId, googleAuthData);
          console.log('✓ Utilisateur mis à jour dans la BD:', backendUser);
        } catch (error: any) {
          console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
          throw new Error('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
        }
      }
      // ÉTAPE 3 bis : Si l'utilisateur n'existe pas, le créer
      else {
        console.log('➕ Étape 3/6 : Nouvel utilisateur - Création dans la BD...');
        try {
          backendUser = await this.createUserService.createUser(googleAuthData as CreateUserDto);
          console.log('✓ Utilisateur créé dans la BD:', backendUser);
        } catch (error: any) {
          console.error('Erreur lors de la création de l\'utilisateur:', error);
          throw new Error('Erreur lors de la création du compte. Veuillez réessayer.');
        }
      }

      // ÉTAPE 4 : Stocker l'utilisateur localement (SecureStorage ou localStorage)
      console.log('💾 Étape 4/6 : Enregistrement dans le storage local...');
      try {
        await this.userStorage.set('user', backendUser);
        console.log('✓ Utilisateur enregistré dans le storage');
      } catch (error: any) {
        console.error('Erreur lors de l\'enregistrement local:', error);
        // Ne pas bloquer la connexion pour cette erreur
      }

      // ÉTAPE 5 : Mettre à jour UserDataService (en mémoire)
      console.log('📝 Étape 5/6 : Mise à jour UserDataService...');
      try {
        await this.userData.initCurrentUser();
        console.log('✓ UserData mis à jour en mémoire');
      } catch (error: any) {
        console.error('Erreur lors de la mise à jour UserData:', error);
        // Ne pas bloquer la connexion pour cette erreur
      }

      // ÉTAPE 6 : Réinitialiser le socket pour rejoindre la room utilisateur
      console.log('🔌 Étape 6/6 : Réinitialisation du socket utilisateur...');
      try {
        const socket = this.socketService.getSocket();
        await this.sessionSocketService.initializeSocket(socket);
        console.log('✓ Socket utilisateur réinitialisé - room rejointe');
      } catch (error: any) {
        console.error('Erreur lors de l\'initialisation du socket:', error);
        // Ne pas bloquer la connexion pour cette erreur
      }

      // ÉTAPE 7 : Initialiser les notifications Push (Token FCM)
      console.log('🔔 Étape 7/6 : Initialisation des notifications Push...');
      try {
        await this.fcmService.setupPushNotifications();
        console.log('✓ Notifications Push initialisées');
        // Petit délai pour laisser le temps au token d'être envoyé si nécessaire
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Erreur non bloquante lors de l\'init Push Notif:', error);
      }

      console.log('🎉 Connexion complète réussie !');

      // Désactiver le flag - tout est terminé avec succès
      this.authState.setGoogleLoginInProgress(false);

      // Retourner l'utilisateur Firebase pour compatibilité avec le code existant
      return firebaseUser;

    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion Google:', error);

      // Désactiver le flag même en cas d'erreur
      this.authState.setGoogleLoginInProgress(false);

      // Gestion des erreurs Firebase spécifiques
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Connexion annulée par l\'utilisateur');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup bloquée par le navigateur. Veuillez autoriser les popups pour ce site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Demande de popup annulée');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Erreur de réseau. Vérifiez votre connexion internet.');
      } else {
        // Erreur backend ou autre
        throw new Error(error.message || `Erreur lors de la connexion avec Google`);
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log('🔓 Déconnexion en cours...');

      // Déconnexion Firebase
      await signOut(this.auth);
      console.log('✓ Déconnexion Firebase réussie');

      // Supprimer les données du storage local
      await this.userStorage.remove('user');
      console.log('✓ Storage local nettoyé');

      // Réinitialiser UserDataService
      this.userData.user = null;
      console.log('✓ UserData réinitialisé');

      console.log('✓ Déconnexion complète réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }
}
