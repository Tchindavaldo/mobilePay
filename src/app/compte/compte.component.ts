import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddEditAccountComponent } from '../add-edit-account/add-edit-account.component';
import { StreamingAccount } from '../streaming-account.model';

@Component({
  selector: 'app-compte',
  templateUrl: './compte.component.html',
  styleUrls: ['./compte.component.scss'],
})
export class CompteComponent  implements OnInit {

 
ngOnInit(): void {
  
}
accounts: StreamingAccount[] = [
  {
    id: 1,
    name: 'MICHAEL',
    type: 'Netflix',
    status: 'Active',
    avatar: '../../assets/31988.jpg'
  },
  {
    id: 2,
    name: 'STEVE',
    type: 'Netflix',
    status: 'Inactive',
    avatar: '../../assets/31988.jpg'
  }
];

constructor(private modalController: ModalController) {}

// Open the modal to add a new account
async openAddAccountModal() {
  const modal = await this.modalController.create({
    component: AddEditAccountComponent,
    componentProps: { isEdit: false }
  });
  modal.onDidDismiss().then(data => {
    if (data.data) {
      this.accounts.push(data.data);
    }
  });
  await modal.present();
}

// Edit an existing account
async editAccount(account: StreamingAccount) {
  const modal = await this.modalController.create({
    component: AddEditAccountComponent,
    componentProps: { account, isEdit: true }
  });
  modal.onDidDismiss().then(data => {
    if (data.data) {
      const index = this.accounts.findIndex(a => a.id === account.id);
      if (index !== -1) this.accounts[index] = data.data;
    }
  });
  await modal.present();
}

// Delete an account
deleteAccount(id: number) {
  this.accounts = this.accounts.filter(account => account.id !== id);
}
}
