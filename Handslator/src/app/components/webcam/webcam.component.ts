import {Component, HostListener, OnInit} from '@angular/core';
import {WebcamImage, WebcamInitError, WebcamModule} from "ngx-webcam";
import {FilesetResolver, GestureRecognizer} from "@mediapipe/tasks-vision";


@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss'],

})

export class WebcamComponent implements OnInit {
  CamErrorMsg = "";
  width: number;
  height: number;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  ngOnInit() {
  }

  handleInitError($event: WebcamInitError) {
    console.warn("Camera access was not allowed by user!");
    this.CamErrorMsg = "Camera access was not allowed by user!";
  }


}
requestAnimationFrame(() => {
});

