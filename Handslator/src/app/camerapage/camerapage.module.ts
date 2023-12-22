import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CamerapagePage } from './camerapage.page';
import { ExploreContainerComponentModule } from '../components/explore-container/explore-container.module';

import { CamerapagePageRoutingModule } from './camerapage-routing.module';
import {CameraCompComponent} from "../components/camera-comp/camera-comp.component";
import {WebcamModule} from "ngx-webcam";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ExploreContainerComponentModule,
        CamerapagePageRoutingModule,
        WebcamModule
    ],
    declarations: [CamerapagePage, CameraCompComponent]
})
export class CamerapagePageModule {}
