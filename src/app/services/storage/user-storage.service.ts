import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root',
})
export class UserStorageService {
  private isPlatformReady = false;
  private isNative = false;

  constructor(private platform: Platform) {
    this.init();
  }

  async init() {
    await this.platform.ready();
    this.isPlatformReady = true;
    this.isNative = this.platform.is('capacitor') || this.platform.is('cordova');
  }

  async set(key: string, value: any) {
    if (this.isPlatformReady && this.isNative) {
      await SecureStoragePlugin.set({ key, value: JSON.stringify(value) });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }

    // console.log('donne set', value, 'key', key);
  }

  async listAll(): Promise<void> {
    if (this.isPlatformReady && this.isNative) {
      try {
        const allKeys = await SecureStoragePlugin.keys();
        console.log('🔐 SecureStorage - Clés existantes :', allKeys.value);

        for (const key of allKeys.value) {
          try {
            const result = await SecureStoragePlugin.get({ key });
            console.log(`Clé: ${key} - Valeur: ${result.value}`);
          } catch (err) {
            console.warn(`Erreur lors de la récupération de la clé ${key}`, err);
          }
        }
      } catch (err) {
        console.error('Erreur lors de l’accès à SecureStorage :', err);
      }
    } else {
      try {
        const allKeys = Object.keys(localStorage);
        console.log('🌐 localStorage - Clés existantes :', allKeys);

        for (const key of allKeys) {
          try {
            const value = localStorage.getItem(key);
            console.log(`Clé: ${key} - Valeur: ${value}`);
          } catch (err) {
            console.warn(`Erreur avec la clé localStorage ${key}`, err);
          }
        }
      } catch (err) {
        console.error('Erreur avec localStorage :', err);
      }
    }
  }

  async get(key: string): Promise<any> {
    if (this.isPlatformReady && this.isNative) {
      try {
        const result = await SecureStoragePlugin.get({ key });
        return JSON.parse(result.value);
      } catch (error) {
        console.warn(`[Storage] Utilisateur non connecté ou clé absente (${key})`, error);
        return null;
      }
    } else {
      const value = localStorage.getItem(key);
      if (!value) {
        console.warn(`[LocalStorage] Utilisateur non connecté ou clé absente (${key})`);
        return null;
      }

      return JSON.parse(value);
    }
  }

  async remove(key: string) {
    if (this.isPlatformReady && this.isNative) {
      await SecureStoragePlugin.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear() {
    if (this.isPlatformReady && this.isNative) {
      await SecureStoragePlugin.clear();
    } else {
      localStorage.clear();
    }
  }
}
