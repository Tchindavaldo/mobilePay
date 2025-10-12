import { Injectable } from '@angular/core';

/**
 * Service pour gérer l'état du processus d'authentification
 * Permet de bloquer les redirections automatiques pendant le login Google
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private isGoogleLoginInProgress = false;

  constructor() {}

  /**
   * Indique qu'une connexion Google est en cours
   * Cela empêchera les redirections automatiques du listener onAuthStateChanged
   */
  setGoogleLoginInProgress(value: boolean) {
    this.isGoogleLoginInProgress = value;
    console.log(`🔒 Google login in progress: ${value}`);
  }

  /**
   * Vérifie si une connexion Google est en cours
   */
  isGoogleLoginActive(): boolean {
    return this.isGoogleLoginInProgress;
  }
}
