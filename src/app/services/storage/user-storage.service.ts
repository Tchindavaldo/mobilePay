import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root',
})
export class UserStorageService {
  private isPlatformReady = false;
  private isNative = false;
  private cache: Map<string, any> = new Map(); // Cache local pour éviter de bloquer le thread principal

  constructor(private platform: Platform) {
    this.init();
  }

  async init() {
    await this.platform.ready();
    this.isPlatformReady = true;
    this.isNative = this.platform.is('capacitor') || this.platform.is('cordova');
  }

  async set(key: string, value: any) {
    // Mettre à jour le cache immédiatement
    this.cache.set(key, value);

    if (this.isPlatformReady && this.isNative) {
      try {
        await SecureStoragePlugin.set({ key, value: JSON.stringify(value) });
      } catch (e) {
        console.error('Erreur SecureStorage set:', e);
      }
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  async get(key: string): Promise<any> {
    // 1. Vérifier si on a la valeur en cache (RÉPONSE INSTANTANÉE)
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // 2. Sinon, aller chercher dans le stockage physique
    let value: any = null;
    if (this.isPlatformReady && this.isNative) {
      try {
        const result = await SecureStoragePlugin.get({ key });
        value = result.value ? JSON.parse(result.value) : null;
      } catch (error) {
        // console.warn(`[Storage] Clé absente (${key})`);
        value = null;
      }
    } else {
      const storageValue = localStorage.getItem(key);
      value = storageValue ? JSON.parse(storageValue) : null;
    }

    // Sauvegarder dans le cache pour la prochaine fois
    if (value !== null) {
      this.cache.set(key, value);
    }
    return value;
  }

  async remove(key: string) {
    this.cache.delete(key);
    if (this.isPlatformReady && this.isNative) {
      try {
        await SecureStoragePlugin.remove({ key });
      } catch (e) { }
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear() {
    this.cache.clear();
    if (this.isPlatformReady && this.isNative) {
      try {
        await SecureStoragePlugin.clear();
      } catch (e) { }
    } else {
      localStorage.clear();
    }
  }

  async listAll(): Promise<void> {
    // Cette méthode est utilisée pour le debug, elle peut rester lente
    if (this.isPlatformReady && this.isNative) {
      try {
        const allKeys = await SecureStoragePlugin.keys();
        console.log('🔐 SecureStorage - Clés existantes :', allKeys.value);
      } catch (err) { }
    }
  }
}
