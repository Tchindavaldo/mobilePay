import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from './notification.component';
import { NotificationRoutingModule } from './notification-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NotificationRoutingModule,
    SharedModule
  ],
  declarations: [NotificationComponent]
})
export class NotificationModule {}
