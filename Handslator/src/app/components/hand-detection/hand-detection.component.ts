// imports ************************************************************************************************************

import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
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

/**
 **********************************************************************************************************************
 * Main component for hand detection and recognition.
 * @Author: Lukas Brumüller
 * @Date: 2024-02-02
 * @Version: 0.1
 * @Description: This component is responsible for the hand detection and recognition. It uses the mediapipe library.
 **********************************************************************************************************************
 **/

export class HandDetectionComponent implements AfterViewInit {

// Fields *************************************************************************************************************

  /* View children */
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;

  /* Variables */
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
  private whichHand !: any;


// Functions **********************************************************************************************************

  /**
   **********************************************************************************************************************
   * @Desciption: This function is called after the view has been initialized. It initializes the camera and the hand detection.
   **********************************************************************************************************************
   **/
  async ngAfterViewInit(): Promise<void> {
    // initialize canvas
    this.canvas = this.canvasElement.nativeElement;
    // initialize video
    this.video = this.videoElement.nativeElement;
    // get canvas context
    this.canvasContext = this.canvas.getContext('2d')!;

    // get camera permission
    if (navigator.mediaDevices.getUserMedia) {
      // get all available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      devices.forEach((device) => {
        // filter for video input devices
        if (device.kind === 'videoinput') {
          this.cameras.push(device);
        }
      });

      // set video settings
      const videoConstraints = {
        video: {
          facingMode: 'user',
        },
        audio: false
      };

      // Access the camera with the given settings
      navigator.mediaDevices.getUserMedia(videoConstraints)
        .then(async (stream) => {
          this.stream = stream;
          // set video source to camera stream
          this.video.srcObject = this.stream;
          TextStorageService.setLastValue("Connecting.....");
          // initialize mediapipe hand detection
          await this.initHandLandmarkDetection();
          TextStorageService.dropData()
          TextStorageService.setLastValue("Loading model.....");
          // load recognition model
          await RecognitionModelService.loadLayersModel();
          TextStorageService.dropData();
          // reset text-size for compatibility with phones
          TextStorageService.setMaxTextLength(10);
        })
        .catch((err) => console.error('Error accessing camera:', err));
    }
    // set the initial camera state
    this.isSwapped = CameraSwapService.getCameraState();
    this.lastVideoTime = 0;
    // start the render loop
    this.renderLoop();
  }

  /**
   * ********************************************************************************************************************
   * @Description: This function is the main render loop. It is responsible for the hand detection and recognition.
   * @private
   * @returns void
   * ********************************************************************************************************************
   */
  private renderLoop(): void {
    this.detectHands();
    requestAnimationFrame(() => {
      this.renderLoop();
    });
  }

  /**
   **********************************************************************************************************************
   * @Description: This function is responsible for the hand detection. It uses the mediapipe library for the detection.
   * @private
   **********************************************************************************************************************
   */
  private detectHands(): void {

    // check if the camera-change button has been pressed
    if (this.isSwapped !== CameraSwapService.getCameraState()) {
      console.log("swap");
      this.isSwapped = CameraSwapService.getCameraState();
      this.switchCamera();
    }

    // check if the video stream is available
    if (!this.video.srcObject) return;

    // check if video is playing and if timestamp is valid
    if (!(this.video.currentTime !== this.lastVideoTime && this.video.currentTime > this.lastVideoTime)) {
      this.video.currentTime = this.lastVideoTime;
      return;
    }

    // set canvas properties
    this.canvas.width = this.video.videoWidth
    this.canvas.height = this.video.videoHeight;
    this.canvasContext.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height); // draw the video frame to canvas

    // check if mediapipe is initialized
    if (!this.handLandmarker) {
      this.lastVideoTime = this.video.currentTime;
      return;
    }

    // detect hands in current frame
    const detections = this.handLandmarker.detectForVideo(this.video, this.lastVideoTime);

    // check if hands were detected
    if (detections.landmarks.length <= 0) {
      this.lastVideoTime = this.video.currentTime;
      return;
    }

    this.whichHand = detections.handedness[0][0].categoryName;
    // add current coordinates to coordinate history (list)
    this.previousPositions.push(this.filterData(detections.landmarks));
    // check if list reached maximum length
    if (this.previousPositions.length > this.MAX_POSITIONS) {
      // remove oldest entry
      this.previousPositions.shift()
    }

    // check if list is full
    if (this.previousPositions.length === this.MAX_POSITIONS) {
      // calculate the mean of all hand positions in the history list
      let differenceTensor = tf.tensor(this.previousPositions).sub(tf.tensor(this.previousPositions[0])).abs().mean();
      // calculate the difference between the current hand position and the mean
      let difference = Math.abs(differenceTensor.dataSync()[0]);

      // check if difference is less then the threshold ---> hand not moving
      if (difference < this.movementThreshold && !this.stopMoment) {
        this.stopMoment = true;
        // clear history
        this.previousPositions = [];
        // filter data
        const data = this.filterData(detections.landmarks);
        // predict data with the recognition model
        const predictionValue = RecognitionModelService.predict(tf.tensor([data]));
        // tell typescript that predictionValue is a tensor
        const prediction = predictionValue as tf.Tensor<tf.Rank>;
        // evaluate prediction ( predictionValue --> letter )
        this.evaluatePrediction(prediction.dataSync());

        // check if hand has moved again ---> reset stopMoment
      } else if (difference > this.movementThreshold * 2) {
        this.stopMoment = false;
      }
    }

    // draw the hand landmarks
    this.drawConnections(detections.landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
    // set new timestamp
    this.lastVideoTime = this.video.currentTime;
  }

  /**
   **********************************************************************************************************************
   * @Description: This function initializes the hand detection with the mediapipe library.
   **********************************************************************************************************************
   */
  async initHandLandmarkDetection() {
    // set the wasm path
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );

    // initialize mediapipe hand detection
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

  /**
   **********************************************************************************************************************
   * @Description: This function is responsible for drawing the connections between the detected landmarks.
   * @param landmarks - the detected landmarks
   * @param HAND_CONNECTIONS - the connections between the landmarks
   * @param param3 - the color and line width for the connections
   * @private
   **********************************************************************************************************************
   */
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

          // Get the landmarks for the start and end of the connection
          const startPoint = landmarks[0][startIdx];
          const endPoint = landmarks[0][endIdx];

          // Get the landmark positions
          const start = this.getLandmarkPosition(startPoint);
          const end = this.getLandmarkPosition(endPoint);

          // Draw lines between the landmarks
          this.canvasContext.beginPath();
          this.canvasContext.moveTo(start.x, start.y);
          this.canvasContext.lineTo(end.x, end.y);
          this.canvasContext.stroke();
        }
      });
    }
  }

  /**
   **********************************************************************************************************************
   * @Description: Helper function for returning the position of a detected landmark.
   * @param landmark - the detected landmark
   * @private
   **********************************************************************************************************************
   */
  private getLandmarkPosition(landmark: NormalizedLandmark): { x: number; y: number } {
    const x = landmark.x * this.canvas.width;
    const y = landmark.y * this.canvas.height;
    return {x, y};
  }

  /**
   **********************************************************************************************************************
   * @Description: This function is responsible for filtering the detected landmarks
   * @param landmarks - the detected landmarks
   * @private
   **********************************************************************************************************************
   */
  private filterData(landmarks: NormalizedLandmark[][]) {

    let filteredList: number[] = [];
    // iterate through the landmarks
    for (let i = 0; i < landmarks[0].length; i++) {
      // check if number is too small and replace it with 0, else multiply it by 1000 and round it to an integer
      (landmarks[0][i].x.toString().includes('e')) ? filteredList.push(0) : filteredList.push((Math.round(landmarks[0][i].x * 1000))); // x
      (landmarks[0][i].y.toString().includes('e')) ? filteredList.push(0) : filteredList.push((Math.round(landmarks[0][i].y * 1000))); // y
      (landmarks[0][i].z.toString().includes('e')) ? filteredList.push(0) : filteredList.push((Math.round(landmarks[0][i].z * 1000))); // z
    }

    if(this.whichHand === "Left") {
      filteredList.map((value, index) => {
        if (index % 3 === 0) {
          filteredList[index] = -value + this.canvas.width;
        }
      })
    }

    const basecoordX = filteredList[0];
    const basecoordY = filteredList[1];

    for (let i = 3; i < filteredList.length; i = i + 3) {
      filteredList[i] = (filteredList[i] - basecoordX);
      filteredList[i + 1] = (filteredList[i + 1] - basecoordY);
    }

    // return the normalized list
    return this.normalize(filteredList);
  }

  /**
   **********************************************************************************************************************
   * @Description: This function is responsible for normalizing the detected landmarks
   * @param list - filtered landmark list
   * @private
   **********************************************************************************************************************
   */
  private normalize(list: number[]) {
    // calculate the normalization number
    const normNumber = (200 / (Math.sqrt(Math.pow(list[12], 2) + Math.pow(list[13], 2))));
    // iterate through the list and normalize the values
    for (let i = 3; i < list.length; i = i + 3) {
      list[i] = Math.floor(list[i] * normNumber);
      list[i + 1] = Math.floor(list[i + 1] * normNumber);
    }
    return list;
  }

  /**
   **********************************************************************************************************************
   * @Description: This function is responsible for switching the camera
   * @private
   **********************************************************************************************************************
   */
  private switchCamera() {
    // closes running tracks
    const tracks = this.stream.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    // clear video source
    this.video.srcObject = null;
    // swap camera
    this.augmentCamera();
  }

  /**
   **********************************************************************************************************************
   * @Description: This function is responsible for switching the camera
   * @private
   **********************************************************************************************************************
   */
  private async augmentCamera() {
    // check camera permission
    if (!navigator.mediaDevices.getUserMedia) {
      return console.log('getUserMedia is not supported');
    }
    try {
      // set video settings
      const videoConstraints = {
        video: {
          facingMode: (this.isSwapped) ? 'user' : 'environment', // user for front camera, environment for back camera
        },
        audio: false,
      };

      // Access the camera
      this.stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      // set video source to camera stream
      this.video.srcObject = this.stream;
      // set timestamp for mediapipe
      if (this.video.currentTime < this.lastVideoTime) {
        this.video.currentTime = this.lastVideoTime;
      }

    } catch (err: any) {
      // error handling *********************************************************************************************
      switch (err.name) {
        case 'NotAllowedError':
          console.error('User denied camera access:', err);
          break;
        case 'NotFoundError' || 'SourceUnavailableError':
          console.error('Camera not found or not available:', err);
          break;
        case 'NotReadableError' || 'TrackStartError':
          console.error('Camera not readable or track start error:', err);
          break;
        default:
          console.error('Camera error:', err);
          break;
      }
    }
  }

  /**
   **********************************************************************************************************************
   * @Description: This function is responsible for evaluating the prediction of the recognition model
   * @param prediction - the prediction of the recognition model
   * @private
   **********************************************************************************************************************
   */
  private evaluatePrediction(prediction: Float32Array | Int32Array | Uint8Array) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"];
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    TextStorageService.setLastValue(letters[maxIndex]);
  }

}





