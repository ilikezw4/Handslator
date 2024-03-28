import {AfterViewInit, Component,} from '@angular/core';
import {Clipboard} from '@capacitor/clipboard';
import {TextStorageService} from "../../services/text-storage/text-storage.service";
import {TextToSpeech} from "@ionic-native/text-to-speech/ngx";
import { isPlatform } from '@ionic/angular';


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
      string: TextStorageService.getInstance().getFullText()
    });
  }

  private async ttsButtonClick() {
    if(isPlatform("mobile")){
      console.log("Mobile");
      const textToSpeech = new TextToSpeech();
      textToSpeech.speak({
        text: TextStorageService.getInstance().getFullText(),
        locale: 'de-DE',
        rate: 0.9
      })
        .then(() =>
          console.log('Done')
        );
    }else if(isPlatform("desktop")){
      console.log("desktop")
      // Create a SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(TextStorageService.getInstance().getFullText());
      // Select a voice
      const voices = speechSynthesis.getVoices();
      utterance.voice = voices[1]; // Choose a specific voice
      // Speak the text
      speechSynthesis.speak(utterance);
    }
  }

  private async clearButtonClick(){
    TextStorageService.getInstance().dropData();
  }
}

