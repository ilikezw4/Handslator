import {AfterViewInit, Component,} from '@angular/core';
import {Clipboard} from '@capacitor/clipboard';
import {TextStorageService} from "../../services/text-storage/text-storage.service";


@Component({
  selector: 'app-textpage',
  templateUrl: './textpage.page.html',
  styleUrls: ['./textpage.page.scss'],
})
export class TextpagePage implements AfterViewInit {

  private copybutton!: HTMLButtonElement;
  private ttsbutton!: HTMLButtonElement;
  private clearbutton !: HTMLButtonElement;

  constructor() {
  }

  async ngAfterViewInit(): Promise<void> {
    this.copybutton = document.getElementById("copyButton") as HTMLButtonElement;
    this.copybutton.addEventListener("click", this.copyButtonClick);
    this.ttsbutton = document.getElementById("ttsButton") as HTMLButtonElement;
    this.ttsbutton.addEventListener("click", this.ttsButtonClick);
    this.clearbutton = document.getElementById("clearButton") as HTMLButtonElement;
    this.clearbutton.addEventListener("click", this.clearButtonClick);


  }

  private async copyButtonClick() {
    await Clipboard.write({
      string: TextStorageService.getFullText()
    });
  }

  private async ttsButtonClick() {
    // Create a SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(TextStorageService.getFullText());

    // Select a voice
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices[0]; // Choose a specific voice

    // Speak the text
    speechSynthesis.speak(utterance);
  }
  private async clearButtonClick(){
    TextStorageService.dropData();
  }
}

