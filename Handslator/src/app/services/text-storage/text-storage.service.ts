/**
 * @author Benjamin Kurz
 *
 * This is a Singleton for the Textstorage
 * acts as a temporary database for the programs output
 */


import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TextStorageService {
  private static instance: TextStorageService;

  private static text!: String;
  private static shortTextLength:number = 20;

  private constructor() {
    TextStorageService.text="";
  }

  /**
   * @getFullText
   * returns the full text
   * will be used in the text output page
   */
  public static getFullText():String{
    if (!TextStorageService.instance){
      return "Nothing here yet";
    }
    return TextStorageService.text;
  }
  /**
   * @getShortText
   * returns the shortened version of the text
   * will be used in the text component
   */
  public static getShortText():String{
    if (!TextStorageService.instance){
      return "Show your hands ;)"
    }
    if (TextStorageService.text.length >TextStorageService.shortTextLength+3){
      return ("..."+TextStorageService.text.slice(TextStorageService.text.length-TextStorageService.shortTextLength,TextStorageService.text.length));
    }
    return TextStorageService.text;
  }
  /**
   * @setLastValue
   * adds a new value to the String
   */
  public static setLastValue(value:String){
    if (!TextStorageService.instance){
      TextStorageService.instance=new TextStorageService();
    }
    TextStorageService.text += value;
  }
}
