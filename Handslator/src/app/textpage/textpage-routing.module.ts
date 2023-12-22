import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TextpagePage } from './textpage.page';

const routes: Routes = [
  {
    path: '',
    component: TextpagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TextpagePageRoutingModule {}
