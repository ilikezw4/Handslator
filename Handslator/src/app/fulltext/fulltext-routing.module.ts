import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FulltextPage } from './fulltext.page';

const routes: Routes = [
  {
    path: '',
    component: FulltextPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FulltextPageRoutingModule {}
