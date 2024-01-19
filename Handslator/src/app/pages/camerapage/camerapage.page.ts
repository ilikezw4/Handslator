import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {HandDetectionComponent} from "../../components/hand-detection/hand-detection.component";
import {CameraSwapService} from "../../services/swap-camera/camera-swap.service";
@Component({
  selector: 'app-camerapage',
  templateUrl: './camerapage.page.html',
  styleUrls: ['./camerapage.page.scss'],
})
export class CamerapagePage implements AfterViewInit{

  private swapButton!: HTMLButtonElement;
  async ngAfterViewInit(): Promise<void> {
    this.swapButton = document.getElementById("swapButton") as HTMLButtonElement;
    this.swapButton.addEventListener("click", this.handleSwap);
  }
  private handleSwap(): void {
    CameraSwapService.swapCamera();
  }
  constructor() {}
}
