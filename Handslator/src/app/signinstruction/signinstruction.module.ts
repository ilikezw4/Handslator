import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SigninstructionPageRoutingModule } from './signinstruction-routing.module';

import { SigninstructionPage } from './signinstruction.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SigninstructionPageRoutingModule
  ],
  declarations: [SigninstructionPage]
})
export class SigninstructionPageModule {}
