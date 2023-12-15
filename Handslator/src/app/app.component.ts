import {Component, HostListener} from '@angular/core';
import {WebcamInitError} from "ngx-webcam";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  CamErrorMsg="";
  width :number;
  height : number;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
  ngOnInit() {}

  handleInitError($event: WebcamInitError) {
    console.warn("Camera access was not allowed by user!");
    this.CamErrorMsg="Camera access was not allowed by user!";
  }
}
