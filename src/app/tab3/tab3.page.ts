import { Component, OnInit, OnDestroy } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase-config';
import { LanguageService, Language } from '../services/language.service';
import { ThemeService } from '../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {
  userName: string | null = null;
  userPhoto: string | null = null;
  userEmail: string | null = null;
  notificationCount: number = 0;

  // Settings properties
  selectedLanguage: Language = 'fr';
  selectedTheme: string = 'light';
  darkModeEnabled: boolean = false;
  
  private langSubscription?: Subscription;
  private themeSubscription?: Subscription;
  notificationsEnabled: boolean = true;
  emailNotificationsEnabled: boolean = true;
  messageNotificationsEnabled: boolean = true;
  biometricEnabled: boolean = false;
  notificationType: string = 'all';

  user = {
    name: 'Michael Steve',
    bio: 'Passionné par les Films action aventures',
    followers: 1250,
    posts: 50,
    likes: 3400,
    recentActivity: [
      { description: 'A publié une nouvelle photo', date: new Date() },
      { description: 'A aimé une publication', date: new Date() },
      { description: 'A suivi un nouveau compte', date: new Date() }
    ]
  };

  constructor(
    public langService: LanguageService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.initializeSettings();
  }

  ngOnDestroy() {
    this.langSubscription?.unsubscribe();
    this.themeSubscription?.unsubscribe();
  }

  initializeSettings() {
    // Initialiser la langue
    this.selectedLanguage = this.langService.getCurrentLanguage();
    this.langSubscription = this.langService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
    });

    // Initialiser le thème
    this.darkModeEnabled = this.themeService.isDarkMode();
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.darkModeEnabled = theme === 'dark';
    });
  }

  onLanguageChange(event: any) {
    const newLang = event.detail.value as Language;
    this.langService.setLanguage(newLang);
  }

  onDarkModeChange(event: any) {
    const enabled = event.detail.checked;
    this.themeService.setTheme(enabled ? 'dark' : 'light');
  }

  t(key: string): string {
    return this.langService.translate(key);
  }

  loadUserData() {
    const auth = getAuth(app);
    const storedUserName = localStorage.getItem('userName');
    const storedUserPhoto = localStorage.getItem('userPhoto');

    if (storedUserName) {
      this.userName = storedUserName;
      this.userPhoto = storedUserPhoto;
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        let fullName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
        this.userName = fullName;
        this.userPhoto = user.photoURL;
        this.userEmail = user.email;

        localStorage.setItem('userName', fullName);
        if (user.photoURL) {
          localStorage.setItem('userPhoto', user.photoURL);
        }
        if (user.email) {
          localStorage.setItem('userEmail', user.email);
        }
      } else {
        if (!this.userName) {
          this.userName = 'Utilisateur';
          this.userPhoto = null;
          this.userEmail = null;
        }
      }
    });
  }

  getUserPhoto(): string {
    if (!this.userPhoto) {
      const storedPhoto = localStorage.getItem('userPhoto');
      if (storedPhoto) {
        this.userPhoto = storedPhoto;
      }
    }
    return this.userPhoto || 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

  onImageError(event: any) {
    event.target.src = 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

  saveSettings() {
    console.log('Paramètres enregistrés:', {
      language: this.selectedLanguage,
      theme: this.selectedTheme,
      notificationsEnabled: this.notificationsEnabled,
      notificationType: this.notificationType,
    });
    // Logique pour enregistrer les paramètres (ex: stockage local)
  }

  changePassword() {
    console.log('Changer le mot de passe');
  }

  deleteAccount() {
    console.log('Supprimer le compte');
    // Logique pour confirmer la suppression du compte
  }

  contactSupport() {
    console.log('Contacter le support');
    // Logique pour contacter le support
  }

  aboutApp() {
    console.log('À propos de l\'application');
    // Logique pour afficher les informations sur l'application
  }
}
