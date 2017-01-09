import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AuthComponent } from './auth.component';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';

@NgModule({
  declarations: [
    AuthComponent,
    SignupComponent,
    SigninComponent,
  ],
  imports:  [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
  ]
})
export class AuthModule {}
