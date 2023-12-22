import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {TextOutputShortComponent} from './components/text-output/text-output.component'
import {TextOutputLongComponent} from "./components/text-output-long/text-output-long.component";
import {WebcamComponent} from "./components/webcam/webcam.component";
import {DetectionComponent} from "./components/detection/detection.component";
import {TestDetComponent} from "./components/test-det/test-det.component";

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }, {
    path: 'text-output',
    component: TextOutputShortComponent
  }
  , {
    path: 'text-output-long',
    component: TextOutputLongComponent
  }, {
    path: 'webcam',
    component: WebcamComponent
  },
  {
    path: 'fulltext',
    loadChildren: () => import('./fulltext/fulltext.module').then( m => m.FulltextPageModule)
  },
  {
    path: 'signinstruction',
    loadChildren: () => import('./signinstruction/signinstruction.module').then( m => m.SigninstructionPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],

  exports: [RouterModule]
})
export class AppRoutingModule {
}
