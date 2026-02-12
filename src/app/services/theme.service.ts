import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserStorageService } from './storage/user-storage.service';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<Theme>('light');
  public theme$ = this.currentTheme.asObservable();

  constructor(private userStorage: UserStorageService) {
    this.initTheme();
  }

  private async initTheme() {
    // Charger le thème sauvegardé
    const savedTheme = (await this.userStorage.get('moobilpay-theme') as Theme) || (await this.userStorage.get('mobilpay-theme') as Theme);

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Mode clair par défaut
      this.setTheme('light');
    }
  }

  async setTheme(theme: Theme): Promise<void> {
    this.currentTheme.next(theme);

    // Appliquer le thème au document
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Sauvegarder le thème
    await this.userStorage.set('moobilpay-theme', theme);

    console.log(`Thème changé vers: ${theme}`);
  }

  getCurrentTheme(): Theme {
    return this.currentTheme.value;
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDarkMode(): boolean {
    return this.currentTheme.value === 'dark';
  }

  isLightMode(): boolean {
    return this.currentTheme.value === 'light';
  }
}
