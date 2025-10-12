import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivationsPage } from './activations.page';

const routes: Routes = [
  {
    path: '',
    component: ActivationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivationsPageRoutingModule {}
