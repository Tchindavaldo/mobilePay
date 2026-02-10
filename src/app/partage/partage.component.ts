import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../services/language.service';
// import { Share } from '@capacitor/share';

@Component({
  selector: 'app-partage',
  templateUrl: './partage.component.html',
  styleUrls: ['./partage.component.scss'],
})
export class PartageComponent implements OnInit {
  // Données de parrainage
  referralCode: string = 'MOOBILPAY2024';
  referralCount: number = 12;
  pendingRewards: number = 3;
  totalPoints: number = 15;
  totalRewards: number = 75;
  
  // QR Code modal
  showQR: boolean = false;
  
  // Share dropdown
  showShareDropdown: boolean = false;

  constructor(public langService: LanguageService) {}

  ngOnInit() {}

  t(key: string): string {
    return this.langService.translate(key);
  }

  // Navigation
  goBack(): void {
    window.history.back();
  }

  async shareAppLink() {
    // Utilisation de l'API Web Share native comme alternative à Capacitor Share
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Découvrez cette application incroyable !',
          text: `Téléchargez cette application avec mon code de parrainage ${this.referralCode}`,
          url: 'https://moobilpay.com',
        });
      } catch (err) {
        console.log('Erreur lors du partage:', err);
      }
    } else {
      // Fallback: copier dans le presse-papier
      const textToCopy = `Découvrez MoobilPay! Code: ${this.referralCode} - https://moobilpay.com`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Lien copié dans le presse-papier!');
      });
    }
  }

  async shareViaWhatsApp() {
    const message = `🎉 Découvrez MoobilPay, l'app qui révolutionne vos abonnements streaming !\n\n⭐ Utilisez mon code de parrainage: ${this.referralCode} et gagnez 1 point !\n\n📱 Téléchargez maintenant: https://moobilpay.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }

  async shareViaFacebook() {
    const url = `https://moobilpay.app?ref=${this.referralCode}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }

  async shareViaTwitter() {
    const message = `🎉 Découvrez MoobilPay avec mon code ${this.referralCode} et gagnez 1 point ! ⭐`;
    const url = `https://moobilpay.app?ref=${this.referralCode}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`, '_blank');
  }

  async shareViaEmail() {
    const subject = 'Découvrez MoobilPay - App de gestion streaming';
    const body = `Salut !\n\nJe voulais te parler de MoobilPay, une super app qui m'aide à gérer tous mes abonnements streaming.\n\nUtilise mon code de parrainage "${this.referralCode}" lors de ton inscription et tu gagneras 1 point de fidélité !\n\nTélécharge l'app ici: https://moobilpay.app?ref=${this.referralCode}\n\nÀ bientôt !`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  }

  async shareViaSMS() {
    const message = `🎉 Découvrez MoobilPay avec mon code ${this.referralCode} et gagnez 1 point ! Téléchargez: https://moobilpay.app?ref=${this.referralCode}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
  }

  // Code de parrainage
  copyReferralCode() {
    navigator.clipboard.writeText(this.referralCode).then(() => {
      // Ici on pourrait ajouter un toast de confirmation
      alert('Code de parrainage copié dans le presse-papiers !');
    }).catch(() => {
      alert('Erreur lors de la copie du code');
    });
  }

  copyCode() {
    this.copyReferralCode();
  }

  // QR Code
  showQRCode() {
    this.showQR = true;
  }

  hideQRCode() {
    this.showQR = false;
  }

  downloadQR() {
    // Ici on implémenterait la génération et le téléchargement du QR code
    alert('Fonctionnalité de téléchargement QR Code à implémenter');
  }

  // Share dropdown
  toggleShareDropdown() {
    this.showShareDropdown = !this.showShareDropdown;
  }
}
