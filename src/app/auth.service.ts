// import { Injectable } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
// import {firebase} from 'firebase/app';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   constructor(private afAuth: AngularFireAuth) {}

//   async register(user: { name: string; email: string; password: string; phone: string }) {
//     const { email, password } = user;
//     return await this.afAuth.createUserWithEmailAndPassword(email, password);
//   }

//   async login(email: string, password: string) {
//     return await this.afAuth.signInWithEmailAndPassword(email, password);
//   }

//   async logout() {
//     return await this.afAuth.signOut();
//   }
// }
