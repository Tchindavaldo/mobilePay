import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountdownService {
  private daysSubject = new BehaviorSubject<number>(0); // Initial state set to 0
  days$ = this.daysSubject.asObservable(); // Expose the observable

  private countdownInterval: any;

  constructor() {}

  startCountdown() {
    // If a countdown is already running, prevent restarting
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Initialize the counter to -28
    this.daysSubject.next(-28); // Emit the initial value

    // Decrement each day
    this.countdownInterval = setInterval(() => {
      const currentDays = this.daysSubject.getValue();
      if (currentDays < 0) {
        this.daysSubject.next(currentDays + 1); // Increment towards 0
      } else {
        clearInterval(this.countdownInterval); // Stop the countdown once it reaches 0
      }
    }, 24 * 60 * 60 * 1000); // For testing quickly (every second)
  }


  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null; // Optionnel: Réinitialisez l'intervalle à null
    }
    this.daysSubject.next(0); // Réinitialiser le compte à rebours à 0
  }

}
