import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TabsPage} from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [{
        path: 'camerapage',
        loadChildren: () => import('../../../../../../../../Users/brumi/Downloads/src/src/app/camerapage/camerapage.module').then(m => m.CamerapagePageModule)
      }, {
        path: 'infopage',
        loadChildren: () => import('../../../../../../../../Users/brumi/Downloads/src/src/app/infopage/infopage.module').then(m => m.InfopagePageModule)
      }, {
        path: 'textpage',
        loadChildren: () => import('../../../../../../../../Users/brumi/Downloads/src/src/app/textpage/textpage.module').then(m => m.TextpagePageModule)
      }, {
        path: '',
        redirectTo: '/tabs/camerapage',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/camerapage',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {
}
