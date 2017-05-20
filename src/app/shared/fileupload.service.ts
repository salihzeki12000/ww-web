import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class FileuploadService  {

  private cloudinaryUrl = `https://api.cloudinary.com/v1_1/wwfileupload/upload`;

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  uploadFile(file)  {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('upload_preset', 'oe7wfrxc');

    return this.http.post(this.cloudinaryUrl, formData)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }
}
