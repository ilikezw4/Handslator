import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SigninstructionPage } from './signinstruction.page';

const routes: Routes = [
  {
    path: '',
    component: SigninstructionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SigninstructionPageRoutingModule {}
