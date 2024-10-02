import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; // Import du ToastController

@Component({
  selector: 'app-payement',
  templateUrl: './payement.component.html',
  styleUrls: ['./payement.component.scss'],
})
export class PayementComponent implements OnInit {
  page: number = 1;          // Débute à la première page
  isLoading: boolean = false; // Indique si la barre de progression doit être affichée
  buffer: number = 0.06;      // Valeur de buffer initiale
  progress: number = 0;       // Valeur de progression initiale

  constructor(private router: Router, private toastController: ToastController) {} // Injecte ToastController

  nextPage() {
    if (this.page < 3) {
      this.page += 1; // Incrémente la page jusqu'à 3
    } else {
      this.showLoadingAndNavigate(); // Affiche la barre de progression et redirige
    }
  }

  showLoadingAndNavigate() {
    this.isLoading = true; // Affiche la barre de progression
    this.buffer = 0.06;    // Réinitialise la valeur de buffer
    this.progress = 0;     // Réinitialise la valeur de progression

    const interval = setInterval(() => {
      this.buffer += 0.06;
      this.progress += 0.06;

      if (this.progress > 1) {
        clearInterval(interval); // Arrête l'intervalle

        setTimeout(() => {
          this.isLoading = false; // Cache la barre de progression
          this.router.navigate(['/tabs/tab1']).then(() => {
            this.resetPager(); // Réinitialise la page après la navigation
            this.presentToast(); // Affiche le toast de confirmation après la redirection
          });
        }, 1000); // Délai d'1 seconde avant la redirection
      }
    }, 1000); // Mise à jour toutes les 1000ms (1 seconde)
  }

  resetPager() {
    this.page = 1; // Réinitialise à la première page
  }

  // Méthode pour afficher le toast
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Le paiement a bien été effectué.',
      duration: 3500,  // Durée d'affichage en millisecondes
      position: 'middle', // Position au centre de l'écran
      cssClass: 'custom-toast', // Classe CSS personnalisée
    });
    await toast.present();
  }

  // Use ngOnInit to handle DOM manipulations
  ngOnInit() {
    const parks: NodeListOf<HTMLElement> = document.querySelectorAll('.park');
    if (parks.length > 0) {
      const activeIndex = localStorage.getItem('activeparkIndex');
      const indexToActivate = activeIndex !== null ? parseInt(activeIndex) : 0;

      if (indexToActivate >= 0 && indexToActivate < parks.length) {
        parks[indexToActivate].classList.add('active');
      } else {
        parks[0].classList.add('active'); // Définit la première div comme active par défaut
      }
    }

    parks.forEach((park: HTMLElement, index: number) => {
      park.addEventListener('click', () => {
        // Retirer la classe 'active' de tous les parks
        parks.forEach((s: HTMLElement) => s.classList.remove('active'));

        // Ajouter la classe 'active' à la div cliquée
        park.classList.add('active');

        // Enregistrer l'index de la div active dans localStorage
        localStorage.setItem('activeparkIndex', index.toString());
      });
    });

    // Query and add event listeners to the clickable divs
    const clickableDivs: NodeListOf<HTMLElement> = document.querySelectorAll('.clickable-div');
    clickableDivs.forEach((element: HTMLElement) => {
      element.addEventListener('click', (event: Event) => {
        const target = event.currentTarget as HTMLElement;
        const prix = target.getAttribute('data-prix');
        const qualite = target.getAttribute('data-qualite');
        const resolution = target.getAttribute('data-resolution');
        const support = target.getAttribute('data-support');
        const appareils = target.getAttribute('data-appareils');
        const telechargement = target.getAttribute('data-telechargement');

        // Update the info divs
        const infoDiv1 = document.getElementById('info-div1');
        if (infoDiv1) infoDiv1.innerText = prix ?? '';

        const infoDiv2 = document.getElementById('info-div2');
        if (infoDiv2) infoDiv2.innerText = qualite ?? '';

        const infoDiv3 = document.getElementById('info-div3');
        if (infoDiv3) infoDiv3.innerText = resolution ?? '';

        const infoDiv4 = document.getElementById('info-div4');
        if (infoDiv4) infoDiv4.innerText = support ?? '';

        const infoDiv5 = document.getElementById('info-div5');
        if (infoDiv5) infoDiv5.innerText = appareils ?? '';

        const infoDiv6 = document.getElementById('info-div6');
        if (infoDiv6) infoDiv6.innerText = telechargement ?? '';
      });
    });
  }

  countries = [
    { name: 'France', flag: 'assets/flags/france.png' },
    { name: 'USA', flag: 'assets/flags/usa.png' },
    { name: 'Canada', flag: 'assets/flags/canada.png' },
  ];

  onCountryChange(event: any) {
    console.log('Pays sélectionné : ', event.detail.value);
  }
}
