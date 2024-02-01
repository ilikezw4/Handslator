import {AfterViewInit, Component, ElementRef, ViewChild, Renderer2} from '@angular/core';
import {FilesetResolver, HandLandmarker} from "@mediapipe/tasks-vision";
import {HAND_CONNECTIONS, LandmarkConnectionArray, NormalizedLandmark} from "@mediapipe/hands";
import {TextStorageService} from "../../services/text-storage/text-storage.service";
import * as tf from '@tensorflow/tfjs';
import {CameraSwapService} from "../../services/swap-camera/camera-swap.service";
import {RecognitionModelService} from "../../services/recognition-model/recognition-model.service";


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
  private movementThreshold = 2.5;
  private stopMoment = false;
  private isSwapped!: boolean;
  private cameras: any[] = [];
  private stream !: MediaStream;

  async ngAfterViewInit(): Promise<void> {
    this.canvas = this.canvasElement.nativeElement;
    this.video = this.videoElement.nativeElement;
    this.canvasContext = this.canvas.getContext('2d')!;
    if (navigator.mediaDevices.getUserMedia) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          this.cameras.push(device);
        }
      });
      const videoConstraints = {
        video: {
          facingMode: 'user',
        },
        audio: false
      };
      // Access the camera
      navigator.mediaDevices.getUserMedia(videoConstraints)
        .then(async (stream) => {
          this.stream = stream;
          this.video.srcObject = this.stream;
          TextStorageService.setLastValue("Connecting.....");
          await this.initHandLandmarkDetection();
          TextStorageService.dropData()
          TextStorageService.setLastValue("Loading model.....");
          await RecognitionModelService.loadLayersModel();
          TextStorageService.dropData();
          TextStorageService.setMaxTextLength(10);
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
      if (this.video.currentTime !== this.lastVideoTime && this.video.currentTime > this.lastVideoTime) {
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight;
        this.canvasContext.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height); // draw the video frame to canvas

        if (this.handLandmarker) {
          const detections = this.handLandmarker.detectForVideo(this.video, this.lastVideoTime);
          if (detections.landmarks.length > 0) {
            // Convert landmarks to a deep copy of the array to avoid references
            this.previousPositions.push(this.filterData(detections.landmarks));
            if (this.previousPositions.length > this.MAX_POSITIONS) {
              this.previousPositions.shift()
            }
            if (this.previousPositions.length === this.MAX_POSITIONS) {
              let differenceTensor = tf.tensor(this.previousPositions).sub(tf.tensor(this.previousPositions[0])).abs().mean();
              let difference = Math.abs(differenceTensor.dataSync()[0]);

              if (difference < this.movementThreshold && !this.stopMoment) {
                this.stopMoment = true;
                this.previousPositions = [];
                const data = this.filterData(detections.landmarks);
                const predictionValue = RecognitionModelService.predict(tf.tensor([data]));
                const prediction = predictionValue as tf.Tensor<tf.Rank>;
                this.evaluatePrediction(prediction.dataSync());
              } else if (difference > this.movementThreshold * 2) {
                this.stopMoment = false;
              }
            }
            this.drawConnections(detections.landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
          }
          this.lastVideoTime = this.video.currentTime;
        }
      } else {
        this.video.currentTime = this.lastVideoTime;
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
          modelAssetPath: "./assets/models/hand_landmarker.task",
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
    const tracks = this.stream.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    this.video.srcObject = null;
    this.augmentCamera();
  }


  private async augmentCamera() {
    if (navigator.mediaDevices.getUserMedia) {
      try {
        const videoConstraints = {
          video: {
            facingMode: (this.isSwapped) ? 'user' : 'environment', // user for front camera, environment for back camera
          },
          audio: false,
        };

        // Access the camera
        this.stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
        this.video.srcObject = this.stream;
        if (this.video.currentTime < this.lastVideoTime) {
          this.video.currentTime = this.lastVideoTime;
        }

      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          // The user denied permission
          console.error('User denied camera access:', err);
        } else if (err.name === 'NotFoundError' || err.name === 'SourceUnavailableError') {
          // Camera not found or not available
          console.error('Camera not found or not available:', err);
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          // Camera is not readable or track start error
          console.error('Camera not readable or track start error:', err);
        } else {
          // Handle other errors
          console.error('Camera error:', err);
        }
      }
    } else {
      console.error('getUserMedia is not supported');
    }
  }

  private evaluatePrediction(prediction: Float32Array | Int32Array | Uint8Array) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"];
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    TextStorageService.setLastValue(letters[maxIndex]);
  }

}





