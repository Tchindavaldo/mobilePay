import axios from 'axios';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface UpdateUserDto {
  // Identifiants principaux
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  password?: string;
  fcmToken?: string;

  // Tokens d'authentification
  accessToken?: string;
  refreshToken?: string;
  expirationTime?: number;

  // Informations de vérification
  emailVerified?: boolean;
  isAnonymous?: boolean;

  // Provider info
  providerId?: string;
  providerData?: any[];  // Données des providers (Google, etc.)

  // Métadonnées temporelles
  metadata?: {
    createdAt?: string;
    lastLoginAt?: string;
    lastSignInTime?: string;
    creationTime?: string;
  };

  // Tenant (si applicable)
  tenantId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UpdateUserService {
  private apiUrl = environment.apiUrl;

  constructor() { }

  /**
   * Met à jour un utilisateur existant dans la base de données
   * @param userId - ID de l'utilisateur dans la BD
   * @param userData - Données à mettre à jour (provenant de Google Auth)
   * @returns User object mis à jour
   */
  async updateUser(userId: string, userData: UpdateUserDto): Promise<any> {
    try {
      console.log(`🔄 Mise à jour de l'utilisateur ID ${userId} avec:`, userData);

      const response = await axios.put(
        `${this.apiUrl}/api/users/${userId}`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      console.log('✓ Utilisateur mis à jour dans la BD:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour de l\'utilisateur (Détails):');
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        console.error('Status:', error.response.status);
        console.error('Headers:', JSON.stringify(error.response.headers));
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error('No response received:', error.request);
      } else {
        // Erreur lors de la configuration de la requête
        console.error('Error Message:', error.message);
      }
      throw error;
    }
  }
}
