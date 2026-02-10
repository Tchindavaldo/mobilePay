import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<Theme>('light');
  public theme$ = this.currentTheme.asObservable();

  constructor() {
    // Charger le thème sauvegardé ou utiliser le mode clair par défaut
    const savedTheme = (localStorage.getItem('moobilpay-theme') as Theme) || (localStorage.getItem('mobilpay-theme') as Theme);
    if (savedTheme) {
      // Migrer l'ancienne clé si nécessaire
      if (!localStorage.getItem('moobilpay-theme') && localStorage.getItem('mobilpay-theme')) {
        localStorage.setItem('moobilpay-theme', savedTheme);
      }
      this.setTheme(savedTheme);
    } else {
      // Mode clair par défaut
      this.setTheme('light');
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme.next(theme);
    
    // Appliquer le thème au document
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Sauvegarder le thème
    localStorage.setItem('moobilpay-theme', theme);
    
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
