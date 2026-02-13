import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Pay2PageRoutingModule } from './pay2-routing.module';

import { Pay2Page } from './pay2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Pay2PageRoutingModule
  ],
  declarations: [Pay2Page]
})
export class Pay2PageModule {}
