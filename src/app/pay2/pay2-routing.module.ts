import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Pay2Page } from './pay2.page';

const routes: Routes = [
  {
    path: '',
    component: Pay2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Pay2PageRoutingModule {}
