import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class LoadingService  {

  updateLoading = new ReplaySubject();

  constructor()  {}

  setLoader(value, message) {
    this.updateLoading.next({
      status: value,
      message: message
    });
  }

}
