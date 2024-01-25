/**
 * TextToSpeechService
 *
 * This class manages the implementation of text-to-speech functionality using the
 * SpeechSynthesis controller of the Web Speech API
 *
 * @author Saints at Play Limited
 * @date 01/03/2023
 * @version 0.1
 * @export
 * @class TextToSpeechService
 * @packageDocumentation
 */
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';


/**
 * @ignore
 */
@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {


  /**
   * @private
   * @property synth
   * @type SpeechSynthesis
   * @memberOf TextToSpeechService
   */
  private synth!: SpeechSynthesis;


  /**
   * @public
   * @property voices
   * @type Array<SpeechSynthesisVoice>
   * @memberof TextToSpeechService
   */
  public voices: Array<SpeechSynthesisVoice> = [];


  /**
   * @public
   * @property selectedVoice
   * @type SpeechSynthesisUtterance
   * @memberof TextToSpeechService
   */
  public selectedVoice!: SpeechSynthesisUtterance;


  /**
   * @constructor
   * @description  Initialise class with necessary properties for subsequent usage
   * @param {AlertController} alert
   * @param {Window} window
   * @memberOf TextToSpeechService
   */
  constructor(private alert: AlertController,
              private window: Window) {  }


  /**
   * @public
   * @method init
   * @description    Initialises the speech synthesis property of the Web Speech API to
   *                 provide speech synthesis functionality (IF supported by the browser)
   */
  public async init() {

    // Is support enabled?
    if ('speechSynthesis' in this.window) {
      this.synth = this.window.speechSynthesis;
    } else {
      // If not inform the user :)
      const alert = await this.alert.create({
        header: 'Sorry!',
        message: 'Your browser does NOT support the Web Speech API',
        buttons: ['Ok']
      });
      await alert.present();
    }
  }

  /**
   * @public
   * @method generateVoices
   * @description   Generates the available voices for the speech synthesis feature
   *                and sort through these in ascending order
   * @returns Array<SpeechSynthesisVoice>
   */
  public generateVoices(): Array<SpeechSynthesisVoice> {
    this.voices = this.synth.getVoices().sort((a: any, b: any) => {
      const aName = a.name.toUpperCase();
      const bName = b.name.toUpperCase();

      if (aName < bName) {
        return -1;
      } else if (aName == bName) {
        return 0;
      } else {
        return +1;
      }
    });

    return this.voices;
  }


  /**
   * @public
   * @method grabVoice
   * @param {string} voice
   * @description   Retrieve the selected voice for use in text-to-speech playback
   * @returns SpeechSynthesisVoice
   */
  public grabVoice(voice: string): SpeechSynthesisVoice {
    let selectedVoice!: SpeechSynthesisVoice;
    for (let i = 0; i < this.voices.length; i++) {
      if (this.voices[i].name === voice) {
        selectedVoice = this.voices[i];
        break;
      }
    }
    return selectedVoice;
  }


  /**
   * @public
   * @method speak
   * @param {string} selectedText
   * @param {string} selectedVoice
   * @param {number} selectedPitch
   * @param {number} selectedRate
   * @param {number} selectedVolume
   * @description   Uses to speak out the entered text with the supplied controls for
   *                managing the speech synthesis (voice, pitch, rate & volume)
   * @returns none
   */
  public speak(selectedText: string,
               selectedVoice: string,
               selectedPitch: number,
               selectedRate: number,
               selectedVolume: number): void {

    // Set speech synthesis properties for playback
    this.selectedVoice          = new SpeechSynthesisUtterance(selectedText);
    this.selectedVoice.voice    = this.grabVoice(selectedVoice);
    this.selectedVoice.rate     = selectedRate;
    this.selectedVoice.pitch    = selectedPitch;
    this.selectedVoice.volume   = selectedVolume;

    // Event listener for managing selected speech events
    this.manageEndOfSpeech();
    this.manageErrorWithSpeech();

    // Speak out!
    this.synth.speak(this.selectedVoice);
  }



  /**
   * @private
   * @method manageEndOfSpeech
   * @description   Event listener which detects end of speech synthesis playback
   * @returns {none}
   */
  private manageEndOfSpeech(): void {
    this.selectedVoice.onend = (event: SpeechSynthesisEvent) => {
      console.log('speech has ended', event);
    };
  }


  /**
   * @private
   * @method manageErrorWithSpeech
   * @description   Event listener which detects error with speech synthesis playback
   * @returns {none}
   */
  private manageErrorWithSpeech(): void {
    this.selectedVoice.onerror = (event: SpeechSynthesisEvent) => {
      console.log('speech encountered an error ended', event);
    };
  }
}
