import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'camerapage',
    loadChildren: () => import('./pages/camerapage/camerapage.module').then(m => m.CamerapagePageModule)
  },
  {
    path: 'infopage',
    loadChildren: () => import('./pages/infopage/infopage.module').then(m => m.InfopagePageModule)
  },
  {
    path: 'textpage',
    loadChildren: () => import('./pages/textpage/textpage.module').then(m => m.TextpagePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
