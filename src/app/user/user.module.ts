import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { UserComponent } from './user.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileDetailsComponent } from './profile/profile-details/profile-details.component';

@NgModule({
  declarations: [
    UserComponent,
    ProfileComponent,
    ProfileDetailsComponent
  ],
  imports:  [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
  ]
})
export class UserModule {}
