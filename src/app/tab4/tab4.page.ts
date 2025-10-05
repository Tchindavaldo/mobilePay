import { Component, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase-config';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  userName: string | null = null;
  userPhoto: string | null = null;
  notificationCount: number = 0;

  constructor() { }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const auth = getAuth(app);
    const storedUserName = localStorage.getItem('userName');
    const storedUserPhoto = localStorage.getItem('userPhoto');

    if (storedUserName) {
      this.userName = storedUserName;
      this.userPhoto = storedUserPhoto;
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        let fullName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
        this.userName = fullName;
        this.userPhoto = user.photoURL;

        localStorage.setItem('userName', fullName);
        if (user.photoURL) {
          localStorage.setItem('userPhoto', user.photoURL);
        }
      } else {
        if (!this.userName) {
          this.userName = 'Utilisateur';
          this.userPhoto = null;
        }
      }
    });
  }

  getUserPhoto(): string {
    if (!this.userPhoto) {
      const storedPhoto = localStorage.getItem('userPhoto');
      if (storedPhoto) {
        this.userPhoto = storedPhoto;
      }
    }
    return this.userPhoto || 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

  onImageError(event: any) {
    event.target.src = 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

}
