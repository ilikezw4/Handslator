import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {TextOutputShortComponent} from "./components/text-output/text-output.component";
import {TextOutputLongComponent} from "./components/text-output-long/text-output-long.component";
import {WebcamModule} from 'ngx-webcam';
import {WebcamComponent} from "./components/webcam/webcam.component";
import {DetectionComponent} from "./components/detection/detection.component";
import {TestDetComponent} from "./components/test-det/test-det.component";

@NgModule({
  declarations: [AppComponent, TextOutputShortComponent, TextOutputLongComponent, WebcamComponent, DetectionComponent, DetectionComponent, TestDetComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,WebcamModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
