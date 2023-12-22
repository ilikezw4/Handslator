import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfopagePageRoutingModule } from './infopage-routing.module';
import { InfopagePage } from './infopage.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule,
    InfopagePageRoutingModule
  ],
  declarations: [InfopagePage]
})
export class InfopagePageModule {}
