import { Injectable } from '@angular/core';
import { UserStorageService } from '../../storage/user-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(private userStorage: UserStorageService) {}
  user!: any;

  async initCurrentUser(): Promise<any> {
    const user = await this.userStorage.get('user');
    if (!user || !user.uid) console.log('Aucun utilisateur connecté');
    this.user = user;
  }

  getCurrentUser = () => this.user;
}
