import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FilesetResolver, HandLandmarker} from "@mediapipe/tasks-vision";
import {HAND_CONNECTIONS, LandmarkConnectionArray, NormalizedLandmark} from "@mediapipe/hands";
import {TextStorageService} from "../../services/text-storage/text-storage.service";
import * as tf from '@tensorflow/tfjs';
import {CameraSwapService} from "../../services/swap-camera/camera-swap.service";

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
  private previousPositions: number[][] = [];
  private MAX_POSITIONS = 10;
  private movementThreshold = 2;
  private stopMoment = false;
  private isSwapped!: boolean;
  private cameras: any[] = [];
  private cameraId = 0;
  private locked = false;


  async ngAfterViewInit(): Promise<void> {
    this.canvas = this.canvasElement.nativeElement;
    this.video = this.videoElement.nativeElement;
    this.canvasContext = this.canvas.getContext('2d')!;
    if (navigator.mediaDevices.getUserMedia) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log(devices)
      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          this.cameras.push(device.deviceId);

        }
      });
      const videoConstraints = {
        video: {deviceId: {exact: this.cameras[0]}},
        audio: false
      };
      // Access the camera
      navigator.mediaDevices.getUserMedia(videoConstraints)
        .then(async (stream) => {
          this.video.srcObject = stream;
          TextStorageService.setLastValue("Connecting.....");
          await this.initHandLandmarkDetection();
          TextStorageService.dropData();
        })
        .catch((err) => console.error('Error accessing camera:', err));
    }
    this.isSwapped = CameraSwapService.getCameraState();
    this.lastVideoTime = -1;
    this.renderLoop();
  }


  private renderLoop(): void {
    if (this.isSwapped !== CameraSwapService.getCameraState()) {
      console.log("swap");
      this.isSwapped = CameraSwapService.getCameraState();
      this.switchCamera();
    }
    if (this.video.srcObject) {
      if (this.video.currentTime !== this.lastVideoTime) {
        this.canvasContext.save(); // save state
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.canvasContext.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height); // draw the video frame to canvas
        this.canvasContext.restore(); // restore to original state

        if (this.handLandmarker) {
          const detections = this.handLandmarker.detectForVideo(this.video, this.lastVideoTime);
          if (detections.landmarks.length > 0) {
            // Convert landmarks to a deep copy of the array to avoid references
            this.previousPositions.push(this.filterData(detections.landmarks));
            if (this.previousPositions.length > this.MAX_POSITIONS) {
              this.previousPositions.shift();
            }
            if (this.previousPositions.length === this.MAX_POSITIONS) {
              let differenceTensor = tf.tensor(this.previousPositions).sub(tf.tensor(this.previousPositions[0])).abs().mean();
              let difference = Math.abs(differenceTensor.dataSync()[0]);

              if (difference < this.movementThreshold && !this.stopMoment) {
                this.stopMoment = true;
                this.previousPositions = [];
                const data = this.filterData(detections.landmarks);
                TextStorageService.setLastValue(data.toString() + "\n");
              } else if (difference > this.movementThreshold * 2) {
                this.stopMoment = false;
              }
            }
            this.drawConnections(detections.landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
          }
          this.lastVideoTime = this.video.currentTime;
        }
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

    let filteredList: number[] = [];
    for (let i = 0; i < landmarks[0].length; i++) {
      (landmarks[0][i].x.toString().includes('e')) ? filteredList.push(0) : filteredList.push((Math.round(landmarks[0][i].x * 1000))); // x
      (landmarks[0][i].y.toString().includes('e')) ? filteredList.push(0) : filteredList.push((Math.round(landmarks[0][i].y * 1000))); // y
      (landmarks[0][i].z.toString().includes('e')) ? filteredList.push(0) : filteredList.push((Math.round(landmarks[0][i].z * 1000))); // z
    }

    const basecoordX = filteredList[0];
    const basecoordY = filteredList[1];

    for (let i = 3; i < filteredList.length; i = i + 3) {
      filteredList[i] = (filteredList[i] - basecoordX);
      filteredList[i + 1] = (filteredList[i + 1] - basecoordY);
    }
    return this.normalize(filteredList);
  }

  private normalize(list: number[]) {
    const normNumber = (200 / (Math.sqrt(Math.pow(list[12], 2) + Math.pow(list[13], 2))));
    for (let i = 3; i < list.length; i = i + 3) {
      list[i] = Math.floor(list[i] * normNumber);
      list[i + 1] = Math.floor(list[i + 1] * normNumber);
    }
    return list;
  }

  private switchCamera() {
    this.video.srcObject = null;
    this.augmentCamera();
  }


  //TODO: fixing "OverconstrainedError" error on some phones (e.g. Samsung A51)
  private async augmentCamera() {
    if (navigator.mediaDevices.getUserMedia) {
      try {
        (this.isSwapped) ? this.cameraId = 0 : this.cameraId = 3;

        if (this.cameras[this.cameraId] !== undefined) {
          const videoConstraints = {
            video: {
              width: this.cameras[this.cameraId].width,
              height: this.cameras[this.cameraId].height,
              facingMode: this.cameras[this.cameraId].facingMode,
              deviceId: {exact: this.cameras[this.cameraId]}
            },
            audio: false
          };

          // Access the camera
          this.video.srcObject = await navigator.mediaDevices.getUserMedia(videoConstraints);
          this.video.currentTime = this.lastVideoTime;
        }

      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }
  }

}





