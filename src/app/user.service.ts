import { Injectable } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  db = getFirestore();
  auth = getAuth();

  constructor() {}

  // Méthode pour récupérer les informations utilisateur
  async getUserProfile() {
    const user = this.auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(this.db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data();  // Retourner les informations de l'utilisateur
      } else {
        console.log('Aucun document trouvé');
        return null;
      }
    } else {
      console.log('Aucun utilisateur connecté');
      return null;
    }
  }
}
