import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { AppHeaderComponent } from './app-header/app-header.component';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [AppHeaderComponent],
  exports: [AppHeaderComponent]
})
export class SharedModule {}
