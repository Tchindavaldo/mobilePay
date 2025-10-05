import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-phone-auth',
  templateUrl: './phone-auth.component.html',
  styleUrls: ['./phone-auth.component.scss'],
})
export class PhoneAuthComponent implements OnInit, OnDestroy {
  verificationCode: string = '';
  resendTimer: number = 45;
  private timerInterval: any;

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.startResendTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startResendTimer() {
    this.resendTimer = 45;
    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  async verifyCode() {
    if (this.verificationCode && this.verificationCode.length === 6) {
      // Simulation de vérification du code
      if (this.verificationCode === '123456') {
        const alert = await this.alertController.create({
          header: 'Vérification réussie',
          message: 'Bienvenue !',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/tabs/tab1']);
      } else {
        const alert = await this.alertController.create({
          header: 'Code incorrect',
          message: 'Le code de vérification est incorrect. Veuillez réessayer.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Code requis',
        message: 'Veuillez entrer le code à 6 chiffres.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  resendCode() {
    if (this.resendTimer <= 0) {
      // Simulation d'envoi du code
      this.startResendTimer();
      // Ici vous pourriez appeler votre service SMS
    }
  }

  changeNumber() {
    this.router.navigate(['/login']);
  }

  goToEmailLogin() {
    this.router.navigate(['/login']);
  }
}
