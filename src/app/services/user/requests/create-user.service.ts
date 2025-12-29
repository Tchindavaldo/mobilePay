import axios from 'axios';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface CreateUserDto {
  // Identifiants principaux
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  password?: string;

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
export class CreateUserService {
  private apiUrl = environment.apiUrl;

  constructor() { }

  /**
   * Crée un nouvel utilisateur dans la base de données
   * @param userData - Données de l'utilisateur à créer
   * @returns User object créé
   */
  async createUser(userData: CreateUserDto): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/users/`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      console.log('✓ Utilisateur créé dans la BD:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }
}
