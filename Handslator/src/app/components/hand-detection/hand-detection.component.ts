import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FilesetResolver, HandLandmarker} from "@mediapipe/tasks-vision";
import {HAND_CONNECTIONS, LandmarkConnectionArray, NormalizedLandmark} from "@mediapipe/hands";
import {TextStorageService} from "../../services/text-storage/text-storage.service";


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
          TextStorageService.setLastValue("Connecting.....");
          await this.initHandLandmarkDetection();
          TextStorageService.dropData();

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
          // console.log(this.filterData(detections.landmarks));
          TextStorageService.setLastValue(this.filterData(detections.landmarks));
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

    let filteredList: string[] = [];
    for (let i = 0; i < landmarks[0].length; i++) {
      (landmarks[0][i].x.toString().includes('e')) ?  filteredList.push('0') : filteredList.push(((Math.round(landmarks[0][i].x * 1000)).toString())); // x
      (landmarks[0][i].y.toString().includes('e')) ?  filteredList.push('0') : filteredList.push(((Math.round(landmarks[0][i].y * 1000).toString()))); // y
      (landmarks[0][i].z.toString().includes('e')) ?  filteredList.push('0') : filteredList.push((Math.round(landmarks[0][i].z * 1000).toString())); // z
    }

    const basecoordX = filteredList[0];
    const basecoordY = filteredList[1];

    for (let i = 3; i < filteredList.length; i = i + 3) {
      filteredList[i] = (parseInt(filteredList[i]) - parseInt(basecoordX)).toString();
      filteredList[i + 1] = (parseInt(filteredList[i + 1]) - parseInt(basecoordY)).toString();
    }
    return this.normalize(filteredList);
  }

  private normalize(list: string[]) {
    const normNumber = (200 / (Math.sqrt(Math.pow(parseInt(list[12]), 2) + Math.pow(parseInt(list[13]), 2))));
    for (let i = 3; i < list.length; i = i + 3) {
      list[i] = (Math.floor(parseInt(list[i]) * normNumber)).toString();
      list[i + 1] = (Math.floor(parseInt(list[i + 1]) * normNumber)).toString();
    }

    return list.toString();
  }
}

