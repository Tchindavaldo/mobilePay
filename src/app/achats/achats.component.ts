import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-achats',
  templateUrl: './achats.component.html',
  styleUrls: ['./achats.component.scss'],
})
export class AchatsComponent  implements OnInit {
  productUrl: string = '';
  productDetails: any;
  loading: boolean = false;
ngOnInit(): void {
  
}
  constructor() {}

  fetchProductDetails() {
    this.loading = true;
    
    // Simuler une requête pour l'extraction des informations du produit
    setTimeout(() => {
      this.productDetails = {
        name: 'Produit Exemple',
        price: '150€',
        imageUrl: 'https://via.placeholder.com/350x150'
      };
      this.loading = false;
    }, 2000); // Simule un délai de 2 secondes
  }

  confirmProduct() {
    console.log('Produit confirmé : ', this.productDetails);
    // Ajouter la logique pour confirmer l'achat ou rediriger l'utilisateur
  }

  cancel() {
    this.productDetails = null;
  }
}
