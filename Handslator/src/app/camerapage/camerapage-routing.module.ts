import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CamerapagePage } from './camerapage.page';

const routes: Routes = [
  {
    path: '',
    component: CamerapagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CamerapagePageRoutingModule {}
