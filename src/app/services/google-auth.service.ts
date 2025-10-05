import { Injectable } from '@angular/core';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { app } from '../../firebase-config';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private auth = getAuth(app);
  private provider = new GoogleAuthProvider();

  constructor() {
    // Configurer le provider Google
    this.provider.addScope('email');
    this.provider.addScope('profile');
  }

  async signInWithGoogle(): Promise<User | null> {
    try {
      // Configurer le provider avec des paramètres personnalisés
      this.provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(this.auth, this.provider);
      const user = result.user;

      console.log('Utilisateur connecté avec Google:', user);
      return user;
    } catch (error: any) {
      console.error('Erreur lors de la connexion Google:', error);

      // Gestion des erreurs spécifiques
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Connexion annulée par l\'utilisateur');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup bloquée par le navigateur. Veuillez autoriser les popups pour ce site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Demande de popup annulée');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Erreur de réseau. Vérifiez votre connexion internet.');
      } else {
        throw new Error(`Erreur lors de la connexion avec Google: ${error.message}`);
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('Utilisateur déconnecté');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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
