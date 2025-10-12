import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { UserStorageService } from '../storage/user-storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InitSessionSocketService {
  user!: any;
  public socketReady = new BehaviorSubject<boolean>(false);

  constructor(private userStorage: UserStorageService) {}

  public async initializeSocket(socket: Socket) {
    // Si le socket est DÉJÀ connecté, rejoindre la room immédiatement
    if (socket.connected) {
      const user = await this.userStorage.get('user');
      
      if (user?.id) {
        socket.emit('join_user', user.id);
        console.log('🆔 Socket ID:', socket.id);
        console.log('👤 Room ID:', user.id);
        this.socketReady.next(true);
      }
    }

    // Configurer les événements pour les futures connexions
    socket.on('connect', async () => {
      const user = await this.userStorage.get('user');
      
      if (user?.id) {
        socket.emit('join_user', user.id);
        console.log('🆔 Socket ID:', socket.id);
        console.log('👤 Room ID:', user.id);
        this.socketReady.next(true);
      }
    });

    socket.on('disconnect', () => {
      this.socketReady.next(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('❌ Erreur de connexion socket:', error);
    });
  }
}
