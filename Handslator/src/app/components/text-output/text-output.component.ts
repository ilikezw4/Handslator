import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {TextStorageService} from "../../services/text-storage/text-storage.service";

@Component({
  selector: 'app-text-output',
  templateUrl: './text-output.component.html',
  styleUrls: ['./text-output.component.scss'],
})
export class TextOutputComponent implements AfterViewInit{
  @ViewChild('textOutput')
  private textOutputRef!: ElementRef<HTMLLabelElement>
  constructor() {}

  ngAfterViewInit(){
    this.renderLoop();
  }

  private renderLoop(){
    this.textOutputRef.nativeElement.innerHTML = TextStorageService.getShortText();
    requestAnimationFrame(() => {
      this.renderLoop();
    });
  }
}

