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
    private fcmService: FcmService,
    private platform: Platform
  ) {
    this.initializeSocialLogin();
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
    this.authState.setGoogleLoginInProgress(true);

    try {
      const isNative = Capacitor.isNativePlatform();
      let firebaseUser: User;

      if (isNative) {
        console.log('📱 [AUTH] Authentification Google NATIVE...');
        const loginResult = await SocialLogin.login({
          provider: 'google',
          options: {}
        });

        console.log('✓ [AUTH] SocialLogin réussie. Résultat brut:', JSON.stringify(loginResult));
        const res = loginResult.result as any;
        const idToken = res.idToken;

        if (!idToken) throw new Error('ID Token manquant');

        const credential = FirebaseGoogleAuthProvider.credential(idToken);
        console.log('🔥 [AUTH] Firebase Étape 1.4 : Envoi du Credential...');

        // Timeout de sécurité de 10s pour éviter le gel sur iOS
        const authPromise = signInWithCredential(this.auth, credential);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Le serveur Firebase ne répond pas (Vérifiez votre connexion)')), 10000)
        );

        const userCredential = await Promise.race([authPromise, timeoutPromise]) as any;
        firebaseUser = userCredential.user;
        console.log('✅ [AUTH] Firebase validée ! UID:', firebaseUser?.uid);
      } else {
        console.log('💻 [AUTH] Authentification Google WEB (Popup)...');
        this.provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(this.auth, this.provider);
        firebaseUser = result.user;
      }

      console.log('✓ [SUCCESS] Authentification Firebase terminée.');

      if (!firebaseUser || !firebaseUser.uid) {
        throw new Error('Aucune donnée utilisateur reçue de Firebase');
      }

      // ÉTAPE 2 : Vérification Backend
      console.log('🔍 [AUTH] Étape 2/6 : Vérification Backend pour:', firebaseUser.email);
      const userEmail = firebaseUser.email;
      if (!userEmail) throw new Error('Aucun email disponible');

      let backendUser;
      try {
        backendUser = await this.getUserService.getUserByEmail(userEmail);
        console.log('📡 [AUTH] Réponse Backend:', !!backendUser);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('❌ [AUTH] Erreur API:', error);
          throw new Error('Le serveur ne répond pas.');
        }
        backendUser = null;
      }

      const googleAuthData: CreateUserDto | UpdateUserDto = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        phoneNumber: firebaseUser.phoneNumber || '',
        accessToken: (firebaseUser as any).stsTokenManager?.accessToken || (firebaseUser as any).accessToken,
        refreshToken: (firebaseUser as any).stsTokenManager?.refreshToken || (firebaseUser as any).refreshToken,
        emailVerified: firebaseUser.emailVerified,
        isAnonymous: firebaseUser.isAnonymous,
        providerId: firebaseUser.providerId,
        providerData: firebaseUser.providerData,
        metadata: {
          createdAt: firebaseUser.metadata?.creationTime,
          lastLoginAt: firebaseUser.metadata?.lastSignInTime,
          lastSignInTime: firebaseUser.metadata?.lastSignInTime,
          creationTime: firebaseUser.metadata?.creationTime,
        },
        tenantId: firebaseUser.tenantId,
      };

      if (backendUser) {
        console.log('🔄 [AUTH] Étape 3/6 : Utilisateur trouvé - Mise à jour...');
        const userId = backendUser.id || backendUser._id;
        backendUser = await this.updateUserService.updateUser(userId, googleAuthData);
      } else {
        console.log('➕ [AUTH] Étape 3/6 : Nouvel utilisateur - Création...');
        backendUser = await this.createUserService.createUser(googleAuthData as CreateUserDto);
      }

      console.log('💾 [AUTH] Étape 4/6 : Enregistrement local...');
      await this.userStorage.set('user', backendUser);
      await this.userData.initCurrentUser();

      console.log('🔌 [AUTH] Étape 6/6 : Initialisation Socket...');
      const socket = this.socketService.getSocket();
      await this.sessionSocketService.initializeSocket(socket);

      console.log('🔔 [AUTH] Étape 7/6 : Initialisation Push...');
      try {
        await this.fcmService.setupPushNotifications();
      } catch (err) { console.warn('Erreur Push:', err); }

      console.log('🎉 [AUTH] Connexion complète réussie !');
      this.authState.setGoogleLoginInProgress(false);
      return firebaseUser;

    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion Google:', error);
      this.authState.setGoogleLoginInProgress(false);
      throw new Error(error.message || `Erreur lors de la connexion avec Google`);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.userStorage.remove('user');
      this.userData.user = null;
      console.log('✓ Déconnexion complète');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  getCurrentUser(): User | null { return this.auth.currentUser; }
  isLoggedIn(): boolean { return this.auth.currentUser !== null; }
}
