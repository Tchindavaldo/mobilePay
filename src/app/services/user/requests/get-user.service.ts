import axios from 'axios';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GetUserService {
  private apiUrl = environment.apiUrl;

  constructor() {}

  /**
   * Récupère un utilisateur par son email (Google Auth)
   * @param email - Email de l'utilisateur
   * @returns User object ou null si non trouvé
   */
  async getUserByEmail(email: string): Promise<any | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/users/email/${email}`, { 
        headers: { 'ngrok-skip-browser-warning': 'true' } 
      });
      console.log('✓ Utilisateur trouvé par email:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Utilisateur non trouvé - c'est normal pour un nouvel utilisateur
        console.log('ℹ️ Utilisateur non trouvé dans la BD (email:', email, ')');
        return null;
      }
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupère un utilisateur par son UID
   * @param uid - UID de l'utilisateur
   * @returns User object ou null si non trouvé
   */
  async getUserByUid(uid: string): Promise<any | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/users/uid/${uid}`, { 
        headers: { 'ngrok-skip-browser-warning': 'true' } 
      });
      console.log('✓ Utilisateur trouvé par UID:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('ℹ️ Utilisateur non trouvé dans la BD (UID:', uid, ')');
        return null;
      }
      console.error('Erreur lors de la récupération de l\'utilisateur par UID:', error);
      throw error;
    }
  }
}
