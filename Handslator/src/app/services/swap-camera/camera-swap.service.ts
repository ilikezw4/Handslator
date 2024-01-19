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
  private static state: boolean;

  private constructor() {
    CameraSwapService.state = true;
  }

  /**
   * @swapCamera swaps between the cameras
   */
  public static swapCamera(){
    if (!CameraSwapService.instance) {
      CameraSwapService.instance = new CameraSwapService();
    }
    CameraSwapService.state=!CameraSwapService.state;
  }

  /**
   * @getCameraState returns the camera state
   */
  public static getCameraState(){
    if (!CameraSwapService.instance) {
      CameraSwapService.instance = new CameraSwapService();
    }
    return CameraSwapService.state;
  }
}


