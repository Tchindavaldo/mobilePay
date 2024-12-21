import { Component, OnInit } from '@angular/core';
import { Game, Pack } from '../../models';

@Component({
  selector: 'app-jeux',
  templateUrl: './jeux.component.html',
  styleUrls: ['./jeux.component.scss'],
})
export class JeuxComponent  implements OnInit {
  games: Game[] = []; // Array to hold games

  ngOnInit() {
    this.fetchGames(); // Fetch games when the component initializes
  }

  fetchGames() {
    // Simulate fetching game data from an API
    this.games = [
      {
        id: 1,
        name: 'Clash of Clans',
        imageUrl: 'https://via.placeholder.com/150',
        packs: [
          { name: 'Pack 1', price: '5.99 €' },
          { name: 'Pack 2', price: '9.99 €' },
        ],
      },
      // Add more games here
    ];
  }

  purchasePack(gameId: number, packName: string) {
    console.log(`Achat du pack ${packName} pour le jeu ID ${gameId}`);
    // Ajoute la logique pour traiter l'achat
  }
}
