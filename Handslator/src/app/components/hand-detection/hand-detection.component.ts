import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FilesetResolver, HandLandmarker} from "@mediapipe/tasks-vision";
import {HAND_CONNECTIONS} from "@mediapipe/hands";


@Component({
  selector: 'app-hand-detection',
  templateUrl: './hand-detection.component.html',
  styleUrls: ['./hand-detection.component.scss'],
})
export class HandDetectionComponent implements OnInit, AfterViewInit {

  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  private video!: HTMLVideoElement;
  private canvas!: HTMLCanvasElement;
  private lastVideoTime!: number;
  private handLandmarker!: HandLandmarker;
  private canvasContext!: CanvasRenderingContext2D;

  constructor() {
  }

  ngOnInit() {
    this.renderLoop();
  }

  async ngAfterViewInit(): Promise<void> {
    this.canvas = this.canvasElement.nativeElement;
    this.video = this.videoElement.nativeElement;
    this.canvasContext = this.canvas.getContext('2d')!;

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true})
        .then(async (stream) => {
          this.video.srcObject = stream;
          await this.initHandLandmarkDetection();
        })
        .catch((err) => console.error('Error accessing camera:', err));
    }

    this.lastVideoTime = -1;
  }


  private renderLoop(): void {
    if (this.handLandmarker && this.video.currentTime !== this.lastVideoTime) {
      const detections = this.handLandmarker.detectForVideo(this.video, this.lastVideoTime);
      console.log(detections.landmarks);
      this.lastVideoTime = this.video.currentTime;
    }
    requestAnimationFrame(() => {
      this.renderLoop();
    });
  }

  async initHandLandmarkDetection() {
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );
    this.handLandmarker = await HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
          delegate: "GPU",
        },
        numHands: 1,
        runningMode: "VIDEO",
      });

  }

}

