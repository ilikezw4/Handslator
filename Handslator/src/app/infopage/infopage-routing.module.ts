import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InfopagePage } from './infopage.page';

const routes: Routes = [
  {
    path: '',
    component: InfopagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfopagePageRoutingModule {}
