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

  /**
   * @swapCamera swaps between the cameras
   */
  public swapCamera(){
    if (!CameraSwapService.instance) {
      CameraSwapService.instance = new CameraSwapService();
    }
    this.state=!this.state;
  }

  /**
   * @getCameraState returns the camera state
   */
  public getCameraState(){
    if (!CameraSwapService.instance) {
      CameraSwapService.instance = new CameraSwapService();
    }
    return this.state;
  }
}


