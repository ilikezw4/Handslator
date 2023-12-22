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
import {HandDetectionComponent} from "./components/hand-detection/hand-detection.component";


@NgModule({
  declarations: [AppComponent, TextOutputShortComponent, TextOutputLongComponent, WebcamComponent, HandDetectionComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,WebcamModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
