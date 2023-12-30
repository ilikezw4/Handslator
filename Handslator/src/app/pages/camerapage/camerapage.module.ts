import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CamerapagePage } from './camerapage.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { CamerapagePageRoutingModule } from './camerapage-routing.module';
import {WebcamModule} from "ngx-webcam";
import {TextOutputComponent} from "../../components/text-output/text-output.component";
import {HandDetectionComponent} from "../../components/hand-detection/hand-detection.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ExploreContainerComponentModule,
        CamerapagePageRoutingModule,
        WebcamModule
    ],
    declarations: [CamerapagePage, TextOutputComponent, HandDetectionComponent]
})
export class CamerapagePageModule {}
