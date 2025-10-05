import { Component, Input, OnInit } from '@angular/core';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  @Input() showSearch: boolean = true;
  @Input() pageTitle: string = '';

  userName: string | null = null;
  userPhoto: string | null = null;
  notificationCount: number = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Load from localStorage if available
    const storedUserName = localStorage.getItem('userName');
    const storedUserPhoto = localStorage.getItem('userPhoto');
    if (storedUserName) this.userName = storedUserName;
    if (storedUserPhoto) this.userPhoto = storedUserPhoto;

    // Subscribe to notifications if service is used elsewhere
    const current = this.notificationService.getNotifications();
    this.notificationCount = current?.length ?? 0;
    this.notificationService.getNotificationsObservable().subscribe(list => {
      this.notificationCount = list?.length ?? 0;
    });
  }

  getFirstName(): string {
    const name = this.userName || 'Utilisateur';
    const first = name.split(' ')[0];
    return first.length > 12 ? first.substring(0, 12) + '...' : first;
  }

  getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonne matinée ! ☀️';
    if (hour < 18) return 'Bon après-midi ! 🌤️';
    return 'Bonne soirée ! 🌙';
  }

  getUserPhoto(): string {
    return this.userPhoto || 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }

  onImageError(event: any) {
    event.target.src = 'assets/3d-illustration-person-with-glasses_23-2149436185-removebg-preview.png';
  }
}
