import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FilesetResolver, HandLandmarker} from "@mediapipe/tasks-vision";
import {HAND_CONNECTIONS, LandmarkConnectionArray, NormalizedLandmark} from "@mediapipe/hands";


@Component({
  selector: 'app-hand-detection',
  templateUrl: './hand-detection.component.html',
  styleUrls: ['./hand-detection.component.scss'],
})
export class HandDetectionComponent implements AfterViewInit {

  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  private video!: HTMLVideoElement;
  private canvas!: HTMLCanvasElement;
  private lastVideoTime!: number;
  private handLandmarker!: HandLandmarker;
  private canvasContext!: CanvasRenderingContext2D;


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
    this.renderLoop();
  }


  private renderLoop(): void {
    if (this.video.currentTime !== this.lastVideoTime) {
      this.canvasContext.save(); // save state
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.canvasContext.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height); // draw the video frame to canvas
      this.canvasContext.restore(); // restore to original state

      if (this.handLandmarker) {
        const detections = this.handLandmarker.detectForVideo(this.video, this.lastVideoTime);
        if (detections.landmarks.length > 0) {
          console.log(detections.landmarks);
          this.filterData(detections.landmarks);
          this.drawConnections(detections.landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
        }
        this.lastVideoTime = this.video.currentTime;
      }
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

  private drawConnections(landmarks: NormalizedLandmark[][], HAND_CONNECTIONS: LandmarkConnectionArray, param3: {
    color: string;
    lineWidth: number;
  }) {
    const {color, lineWidth} = param3;

    // Set the line style
    this.canvasContext.strokeStyle = color;
    this.canvasContext.lineWidth = lineWidth;
    this.canvasContext.fillStyle = color;

    // Check if landmarks array is defined and has at least one hand
    if (landmarks && landmarks.length > 0 && landmarks[0].length > 0) {
      // Iterate through connections and draw lines
      HAND_CONNECTIONS.forEach((connection) => {
        const [startIdx, endIdx] = connection;

        // Check if indices are within bounds
        if (
          startIdx >= 0 &&
          startIdx < landmarks[0].length &&
          endIdx >= 0 &&
          endIdx < landmarks[0].length
        ) {
          const startPoint = landmarks[0][startIdx];
          const endPoint = landmarks[0][endIdx];


          const start = this.getLandmarkPosition(startPoint);
          const end = this.getLandmarkPosition(endPoint);

          // Draw line
          this.canvasContext.beginPath();
          this.canvasContext.moveTo(start.x, start.y);
          this.canvasContext.lineTo(end.x, end.y);
          this.canvasContext.stroke();
        }
      });
    }
  }

  // Helper function to get the landmark position in canvas coordinates
  private getLandmarkPosition(landmark: NormalizedLandmark): { x: number; y: number } {
    const x = landmark.x * this.canvas.width;
    const y = landmark.y * this.canvas.height;
    return {x, y};
  }


  private filterData(landmarks: NormalizedLandmark[][]) {

  }
}

