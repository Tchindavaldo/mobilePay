import { Injectable } from '@angular/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { UserStorageService } from '../storage/user-storage.service';
import { UserDataService } from '../user/data/user-data.service';
import { GetUserService } from '../user/requests/get-user.service';
import { CreateUserService, CreateUserDto } from '../user/requests/create-user.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private userStorage: UserStorageService,
    private userData: UserDataService,
    private getUserService: GetUserService,
    private createUserService: CreateUserService
  ) {
    // Initialiser Google Auth
    this.initializeGoogleAuth();
  }

  /**
   * Initialise Google Auth (nécessaire pour Capacitor)
   */
  private async initializeGoogleAuth() {
    try {
      await GoogleAuth.initialize({
        clientId: environment.googleClientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    } catch (error) {
      console.error('Erreur initialisation Google Auth:', error);
    }
  }

  /**
   * Connexion via Google Auth
   * 1. Authentifie l'utilisateur avec Google
   * 2. Récupère ou crée l'utilisateur dans la BD
   * 3. Stocke l'utilisateur localement
   * 4. Met à jour le service UserData
   */
  async signInWithGoogle(): Promise<any> {
    try {
      console.log('🔐 Début de la connexion Google...');
      
      // Étape 1 : Authentification Google
      const googleUser = await GoogleAuth.signIn();
      console.log('✓ Authentification Google réussie:', googleUser);

      if (!googleUser || !googleUser.id) {
        throw new Error('Aucune donnée utilisateur reçue de Google');
      }

      const uid = googleUser.id;
      const email = googleUser.email;
      const displayName = googleUser.name;
      const photoURL = googleUser.imageUrl;

      // Étape 2 : Vérifier si l'utilisateur existe dans la BD
      console.log('🔍 Vérification de l\'utilisateur dans la BD...');
      let user = await this.getUserService.getUserByUid(uid);

      // Étape 3 : Si l'utilisateur n'existe pas, le créer
      if (!user) {
        console.log('➕ Utilisateur non trouvé, création dans la BD...');
        
        const newUserData: CreateUserDto = {
          uid: uid,
          email: email,
          displayName: displayName,
          photoURL: photoURL,
        };

        user = await this.createUserService.createUser(newUserData);
        console.log('✓ Utilisateur créé:', user);
      } else {
        console.log('✓ Utilisateur trouvé dans la BD:', user);
      }

      // Étape 4 : Stocker l'utilisateur localement (SecureStorage ou localStorage)
      console.log('💾 Enregistrement de l\'utilisateur dans le storage...');
      await this.userStorage.set('user', user);
      console.log('✓ Utilisateur enregistré dans le storage');

      // Étape 5 : Mettre à jour le service UserData (mémoire)
      await this.userData.initCurrentUser();
      console.log('✓ UserData mis à jour');

      console.log('🎉 Connexion complète réussie !');
      return user;

    } catch (error) {
      console.error('❌ Erreur lors de la connexion Google:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   * 1. Déconnecte de Google
   * 2. Supprime les données locales
   * 3. Réinitialise UserData
   */
  async signOut(): Promise<void> {
    try {
      console.log('🔓 Déconnexion...');
      
      // Déconnexion Google
      await GoogleAuth.signOut();
      
      // Supprimer le storage local
      await this.userStorage.remove('user');
      
      // Réinitialiser UserData
      this.userData.user = null;
      
      console.log('✓ Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur est connecté
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.userStorage.get('user');
      return !!user && !!user.uid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère l'utilisateur actuel depuis le storage
   */
  async getCurrentUser(): Promise<any> {
    try {
      return await this.userStorage.get('user');
    } catch (error) {
      return null;
    }
  }

  /**
   * Rafraîchit les données de l'utilisateur depuis la BD
   */
  async refreshUser(): Promise<any> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser || !currentUser.uid) {
        throw new Error('Aucun utilisateur connecté');
      }

      // Récupérer les données à jour depuis la BD
      const updatedUser = await this.getUserService.getUserByUid(currentUser.uid);
      
      if (updatedUser) {
        // Mettre à jour le storage
        await this.userStorage.set('user', updatedUser);
        
        // Mettre à jour UserData
        await this.userData.initCurrentUser();
        
        return updatedUser;
      }

      return currentUser;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de l\'utilisateur:', error);
      throw error;
    }
  }
}
