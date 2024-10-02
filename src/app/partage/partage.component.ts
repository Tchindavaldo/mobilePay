import { Component, OnInit } from '@angular/core';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-partage',
  templateUrl: './partage.component.html',
  styleUrls: ['./partage.component.scss'],
})
export class PartageComponent  implements OnInit {



  ngOnInit() {}

  constructor() {}

  async shareAppLink() {
    await Share.share({
      title: 'Découvrez cette application incroyable !',
      text: 'Téléchargez cette application avec mon code de parrainage CODE12345',
      url: 'https://mobilpay.com',
      dialogTitle: 'Partager l\'application',
    });
  }

  async shareViaWhatsApp() {
    window.open('https://wa.me/?text=Téléchargez cette app avec mon code CODE12345 : https://votreapplication.com', '_blank');
  }

  async shareViaFacebook() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=https://votreapplication.com', '_blank');
  }

  async shareViaTwitter() {
    window.open('https://twitter.com/intent/tweet?url=https://votreapplication.com&text=Téléchargez cette app avec mon code CODE12345', '_blank');
  }

  async shareViaEmail() {
    window.open('mailto:?subject=Découvrez cette app &body=Téléchargez cette app avec mon code CODE12345 : https://votreapplication.com', '_blank');
  }

  copyCode() {
    navigator.clipboard.writeText('CODE12345');
    alert('Code de parrainage copié !');
  }
}
