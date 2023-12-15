import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FulltextPageRoutingModule } from './fulltext-routing.module';

import { FulltextPage } from './fulltext.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FulltextPageRoutingModule
  ],
  declarations: [FulltextPage]
})
export class FulltextPageModule {}
