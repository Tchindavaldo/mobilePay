import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  title: string;
  message: string;
  image: string;
  time: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {



  private notifications: Notification[] = [];
  private notificationsSubject = new Subject<Notification[]>();

  constructor() {}

  getNotifications() {
    return this.notifications;
  }

  getNotificationsObservable() {
    return this.notificationsSubject.asObservable();
  }

  addNotification(notification: Notification) {
    this.notifications.push(notification);
    this.notificationsSubject.next(this.notifications);
  }
}
