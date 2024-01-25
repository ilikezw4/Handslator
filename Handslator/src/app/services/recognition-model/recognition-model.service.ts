import { Injectable } from '@angular/core';
import * as tf from "@tensorflow/tfjs";

@Injectable({
  providedIn: 'root'
})
export class RecognitionModelService {
  private static instance: RecognitionModelService;
  private static model: tf.LayersModel | tf.GraphModel;
  constructor() { }

  public static async loadLayersModel() {
    this.model = await tf.loadLayersModel('assets/models/model.json');
    console.log("Layers model loaded");
  }
  public static async loadGraphModel() {
    this.model = await tf.loadGraphModel('assets/models/model.json');
    console.log("Graph model loaded");
  }

  public static predict(ToPredictData:any) {
    return this.model.predict(ToPredictData);
  }
}
