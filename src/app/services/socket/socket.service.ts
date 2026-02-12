import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { InitSessionSocketService } from './init-session-socket.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private apiUrl = environment.apiUrl;

  constructor(
    private sessionSocketService: InitSessionSocketService
  ) {
    console.log('🔌 Initialisation Socket.IO vers:', this.apiUrl);
    this.socket = io(this.apiUrl, {
      transports: ['polling', 'websocket'], // Polling en premier pour meilleure compatibilité
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5, // Réessayer indéfiniment
      autoConnect: true,
      path: '/socket.io'
    });
  }

  /**
   * Initialise tous les sockets de l'application
   * Appelé au démarrage dans tabs.page.ts
   */
  public initializeAllSockets() {
    console.log('🚀 Initialisation de tous les sockets...');

    // Initialiser le socket de session utilisateur
    this.sessionSocketService.initializeSocket(this.socket);

    console.log('✅ Tous les sockets ont été initialisés');
  }

  /**
   * Récupère l'instance Socket.IO pour usage avancé
   */
  public getSocket(): Socket {
    return this.socket;
  }

  /**
   * Déconnecte proprement le socket
   */
  public disconnect() {
    if (this.socket) {
      console.log('🔌 Déconnexion du socket...');
      this.socket.disconnect();
    }
  }
}
