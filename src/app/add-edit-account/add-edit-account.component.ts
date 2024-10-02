import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StreamingAccount } from '../streaming-account.model';

@Component({
  selector: 'app-add-edit-account',
  templateUrl: './add-edit-account.component.html',
  styleUrls: ['./add-edit-account.component.scss'],
})
export class AddEditAccountComponent  implements OnInit {

 

  ngOnInit() {}
  @Input() account: StreamingAccount = { id: 0, name: '', type: '', status: 'Active', avatar: '' };
  @Input() isEdit: boolean = false;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  saveAccount() {
    if (!this.isEdit) {
      this.account.id = Math.random();  // For simplicity, generate a random ID
    }
    this.modalController.dismiss(this.account);
  }

}
