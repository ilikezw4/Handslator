import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TextStorageService} from "../../services/text-storage/text-storage.service";

@Component({
  selector: 'app-text-output-long',
  templateUrl: './text-output-long.component.html',
  styleUrls: ['./text-output-long.component.scss'],
})
export class TextOutputLongComponent  implements OnInit {
  @ViewChild('textOutputLong')
  private textOutputLong!: ElementRef<HTMLLabelElement>;

  constructor() {}

  ngOnInit() {}


  ngAfterViewInit(){
    this.textOutputLong.nativeElement.innerHTML = TextStorageService.getFullText();
  }

}
