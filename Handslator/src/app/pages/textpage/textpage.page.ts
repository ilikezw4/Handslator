import {AfterViewInit, Component, } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';
import {TextStorageService} from "../../services/text-storage/text-storage.service";

@Component({
  selector: 'app-textpage',
  templateUrl: './textpage.page.html',
  styleUrls: ['./textpage.page.scss'],
})
export class TextpagePage implements AfterViewInit{

  private button!: HTMLButtonElement;
  async ngAfterViewInit(): Promise<void> {
    this.button = document.getElementById("copyButton") as HTMLButtonElement;
    this.button.addEventListener("click", this.buttonClick);
  }
  constructor() {
  }

  private async buttonClick(){
    await Clipboard.write({
      string: TextStorageService.getFullText()
    });
  }
}
