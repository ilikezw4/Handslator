import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CamerapagePage } from './camerapage.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { CamerapagePageRoutingModule } from './camerapage-routing.module';
import {WebcamComponent} from "../../components/webcam/webcam.component";
import {WebcamModule} from "ngx-webcam";
import {TextOutputShortComponent} from "../../components/text-output/text-output.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ExploreContainerComponentModule,
        CamerapagePageRoutingModule,
        WebcamModule
    ],
  declarations: [CamerapagePage, WebcamComponent, TextOutputShortComponent]
})
export class CamerapagePageModule {}
