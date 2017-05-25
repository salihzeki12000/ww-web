import { NgModule }                         from '@angular/core';
import { CommonModule }                     from '@angular/common';

import { GooglePlaceSearchComponent, GoogleCheckinComponent } from '../google-api';

@NgModule({
  declarations: [
    GooglePlaceSearchComponent,
    GoogleCheckinComponent,
  ],
  exports: [
    CommonModule,
    GooglePlaceSearchComponent,
    GoogleCheckinComponent,
  ]
})
export class SharedModule {}
