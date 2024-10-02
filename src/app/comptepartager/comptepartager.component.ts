import { Component, OnInit } from '@angular/core';

// Définir l'interface pour un compte Netflix en dehors de la classe
interface NetflixAccount {
  name: string;
  avatar: string;
  plan: string;
}

@Component({
  selector: 'app-comptepartager',
  templateUrl: './comptepartager.component.html',
  styleUrls: ['./comptepartager.component.scss'],
})
export class ComptepartagerComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

  // Exemple de comptes Netflix
  netflixAccounts: NetflixAccount[] = [
    { name: 'Profil 1', avatar: '../../assets/profil1.jpeg', plan: 'Premium' },
    { name: 'Profil 2', avatar: '../../assets/profil4.jpeg', plan: 'Standard' },
    { name: 'Profil 3', avatar: '../../assets/profil3.jpeg', plan: 'Basic' },
    { name: 'Profil 1', avatar: '../../assets/OIP.jpeg', plan: 'Premium' },
    { name: 'Profil 2', avatar: '../../assets/profil5.jpeg', plan: 'Standard' },
    { name: 'Profil 3', avatar: '../../assets/profil3.jpeg', plan: 'Basic' }
  ];

  // Fonction pour sélectionner un compte
  selectAccount(account: NetflixAccount) {
    console.log('Compte sélectionné:', account);
    // Redirection ou affichage de l'interface Netflix associée
  }

  // Fonction pour ajouter un compte
  addAccount() {
    console.log('Ajout d\'un nouveau compte');
    // Logique d'ajout d'un compte Netflix
  }

  // Fonction pour modifier un compte
  editAccount(account: NetflixAccount) {
    console.log('Modification du compte:', account);
    // Logique pour modifier le compte sélectionné
  }

  // Fonction pour supprimer un compte
  deleteAccount(account: NetflixAccount) {
    console.log('Suppression du compte:', account);
    this.netflixAccounts = this.netflixAccounts.filter(acc => acc !== account);
  }
}
