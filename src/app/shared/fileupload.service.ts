import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class FileuploadService  {

  private cloudinaryUrl = `https://api.cloudinary.com/v1_1/wwfileupload/`;
  private url = 'https://vast-island-87972.herokuapp.com';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  uploadFile(file)  {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('upload_preset', 'oe7wfrxc');

    return this.http.post(this.cloudinaryUrl + 'upload/', formData)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  uploadProfile(file)  {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('upload_preset', 'vdilgfmv');

    return this.http.post(this.cloudinaryUrl + 'upload/', formData)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }

  deleteFile(public_id) {
    return this.http.delete(this.url + '/image/' + public_id)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }
}

// newFile(file) {
//   const body = JSON.stringify(file);
//   const headers = new Headers({ 'Content-Type': 'application/json' });
//
//   return this.http.post(this.url + '/image/new', body, { headers: headers })
//                   .map((response: Response) => {
//                     console.log(response.json())
//                     return response.json();
//                   })
//                   .catch((error: Response) => {
//                     this.errorMessageService.handleErrorMessage(error.json());
//                     return Observable.throw(error.json())
//                   });
// }
