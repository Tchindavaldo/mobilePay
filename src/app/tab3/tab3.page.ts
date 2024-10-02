import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  // constructor() {}
  // page = 1;

  // nextPage() {
  //   this.page = (this.page % 3) + 1; 
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

  constructor() {}

  selectedLanguage: string = 'fr';
  selectedTheme: string = 'light';
  notificationsEnabled: boolean = true;
  notificationType: string = 'all';

 

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

