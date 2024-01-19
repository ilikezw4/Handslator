/**
 * @author Benjamin Kurz
 *
 * This is a Singleton for the Camera State
 * Controlls the state of the camera
 */
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraSwapService {
  private static instance: CameraSwapService;
  private state: boolean;

  private constructor() {
    this.state = true;
  }
  public swapCamera(){
    this.state=!this.state;
  }
  public getCameraState(){
    return this.state;
  }
}


