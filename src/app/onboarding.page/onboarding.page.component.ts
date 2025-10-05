import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding.page',
  templateUrl: './onboarding.page.component.html',
  styleUrls: ['./onboarding.page.component.scss'],
})
export class OnboardingPageComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 3;

  constructor(private router: Router) {}

  ngOnInit() {}

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      // Dernière étape, marquer l'onboarding comme vu et aller à la page de connexion
      this.markOnboardingAsSeen();
      this.router.navigate(['/login']);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  skipOnboarding() {
    this.markOnboardingAsSeen();
    this.router.navigate(['/login']);
  }

  private markOnboardingAsSeen() {
    localStorage.setItem('hasSeenOnboarding', 'true');
  }
}
