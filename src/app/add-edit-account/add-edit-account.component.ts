import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StreamingAccount } from '../streaming-account.model';

interface Platform {
  name: string;
  icon: string;
  price: string;
  color: string;
}

@Component({
  selector: 'app-add-edit-account',
  templateUrl: './add-edit-account.component.html',
  styleUrls: ['./add-edit-account.component.scss'],
})
export class AddEditAccountComponent implements OnInit {
  @Input() account: StreamingAccount = { id: 0, name: '', type: '', status: 'Active', avatar: '' };
  @Input() isEdit: boolean = false;

  // Step management
  currentStep: number = 1;
  
  // Account status
  isAccountActive: boolean = true;
  
  // Avatar selection
  selectedAvatarIndex: number = 0;
  
  // Available platforms
  platforms: Platform[] = [
    { name: 'Netflix', icon: 'tv', price: '15.99€/mois', color: '#e50914' },
    { name: 'Disney+', icon: 'star', price: '8.99€/mois', color: '#113ccf' },
    { name: 'Spotify', icon: 'musical-notes', price: '9.99€/mois', color: '#1ed760' },
    { name: 'Amazon Prime', icon: 'play', price: '6.99€/mois', color: '#ff9900' },
    { name: 'Apple TV+', icon: 'logo-apple', price: '6.99€/mois', color: '#000000' },
    { name: 'HBO Max', icon: 'film', price: '14.99€/mois', color: '#8b5cf6' }
  ];
  
  // Available avatars
  avatars: string[] = [
    'assets/avatars/avatar1.jpg',
    'assets/avatars/avatar2.jpg', 
    'assets/avatars/avatar3.jpg',
    'assets/avatars/avatar4.jpg',
    'assets/avatars/avatar5.jpg',
    'assets/avatars/avatar6.jpg'
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    // Initialize account status
    this.isAccountActive = this.account.status === 'Active';
    
    // Set default avatar if editing
    if (this.isEdit && this.account.avatar) {
      const avatarIndex = this.avatars.findIndex(avatar => avatar === this.account.avatar);
      if (avatarIndex !== -1) {
        this.selectedAvatarIndex = avatarIndex;
      }
    }
  }

  // Progress management
  getProgressPercentage(): number {
    return (this.currentStep / 3) * 100;
  }

  // Step navigation
  nextStep(): void {
    if (this.canProceed() && this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.account.type;
      case 2:
        return !!this.account.name && this.account.name.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }

  canSave(): boolean {
    return !!this.account.type && !!this.account.name && this.account.name.trim().length > 0;
  }

  // Platform selection
  selectPlatform(platform: Platform): void {
    this.account.type = platform.name;
  }

  getSelectedPlatform(): Platform | undefined {
    return this.platforms.find(p => p.name === this.account.type);
  }

  // Avatar selection
  selectAvatar(index: number): void {
    this.selectedAvatarIndex = index;
    this.account.avatar = this.avatars[index];
  }

  // Status management
  updateAccountStatus(): void {
    this.account.status = this.isAccountActive ? 'Active' : 'Inactive';
  }

  // Modal actions
  dismiss(): void {
    this.modalController.dismiss();
  }

  saveAccount(): void {
    if (!this.canSave()) {
      return;
    }

    // Ensure avatar is set
    if (!this.account.avatar) {
      this.account.avatar = this.avatars[this.selectedAvatarIndex];
    }

    // Update status
    this.updateAccountStatus();

    // Generate ID for new accounts
    if (!this.isEdit) {
      this.account.id = Date.now(); // Better than Math.random()
    }

    this.modalController.dismiss(this.account);
  }
}
