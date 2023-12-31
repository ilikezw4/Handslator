import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TextpagePageRoutingModule } from './textpage-routing.module';
import { TextpagePage } from './textpage.page';
import {ExploreContainerComponentModule} from "../../explore-container/explore-container.module";
import {TextOutputLongComponent} from "../../components/text-output-long/text-output-long.component";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TextpagePageRoutingModule,
    ExploreContainerComponentModule
  ],
    declarations: [TextpagePage, TextOutputLongComponent]
})
export class TextpagePageModule {}
