/**
 * @author Benjamin Kurz
 *
 * This is a Singleton for the Textstorage
 * acts as a temporary database for the programs output
 */


import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TextStorageService {
  private static instance: TextStorageService;
  private text: string;
  private shortTextLength: number = 20;

  private constructor() {
    this.text = "";
  }

  public static getInstance():TextStorageService{
    if(!TextStorageService.instance){
      TextStorageService.instance = new TextStorageService();
    }
    return TextStorageService.instance;
  }
  /**
   * @getFullText
   * returns the full text
   * will be used in the text output page
   */
  public getFullText(): string {
    if (this.text == "") {
      return "Noch keine Buchstaben erkannt";
    }
    return this.text;
  }

  /**
   * @getShortText
   * returns the shortened version of the text
   * will be used in the text component
   */
  public getShortText(): string {
    if (this.text == "") {
      return "Zeige deine Hand";
    }
    if (this.text.length > this.shortTextLength + 3) {
      return ("..." + this.text.slice(this.text.length - this.shortTextLength, this.text.length));
    }
    return this.text;
  }

  /**
   * @setLastValue
   * adds a new value to the String
   */
  public setLastValue(value: string) {
    this.text = this.text.concat(value)
  }

  /**
   * @dropData
   * deletes previous Data.
   */
  public dropData() {
    if (TextStorageService.instance) {
      this.text = "";
    }
  }
  public dropLastLetter() {
    this.text = this.text.substring(0,this.text.length-1);
  }

  public setMaxTextLength(length: number) {
    this.shortTextLength = length;
  }
}
