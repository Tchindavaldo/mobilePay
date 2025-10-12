import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActivationsPageRoutingModule } from './activations-routing.module';

import { ActivationsPage } from './activations.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActivationsPageRoutingModule
  ],
  declarations: [ActivationsPage]
})
export class ActivationsPageModule {}
