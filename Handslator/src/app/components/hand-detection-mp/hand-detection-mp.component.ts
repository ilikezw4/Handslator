import {FilesetResolver, HandLandmarker} from "@mediapipe/tasks-vision";

async function loadHandDetection() {
  const vision = await FilesetResolver.forVisionTasks(
    // path/to/wasm/root
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  const handLandmarker = await HandLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: "hand_landmarker.task"
      },
      numHands: 2
    });
  const image = document.getElementById("image") as HTMLImageElement;
  const handLandmarkerResult = handLandmarker.detect(image);
  console.log(handLandmarkerResult);
}





