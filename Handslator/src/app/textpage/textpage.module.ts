import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TextpagePageRoutingModule } from './textpage-routing.module';
import { TextpagePage } from './textpage.page';
import {ExploreContainerComponentModule} from "../components/explore-container/explore-container.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TextpagePageRoutingModule,
    ExploreContainerComponentModule
  ],
  declarations: [TextpagePage]
})
export class TextpagePageModule {}
