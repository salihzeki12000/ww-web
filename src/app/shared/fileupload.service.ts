import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable, ReplaySubject } from 'rxjs';

import { ErrorMessageService } from '../error-message';

@Injectable()
export class FileuploadService  {

  private cloudinaryUrl = `https://api.cloudinary.com/v1_1/wwfileupload/`;

  profile = 'w_150,h_150,c_fill,g_faces';

  constructor(
    private http: Http,
    private errorMessageService: ErrorMessageService)  {}

  uploadFile(file, type)  {
    let transform = '';

    if(type === 'profile')  {
      transform = this.profile
    }

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

  deleteFile(public_id)  {
    const route = 'resources/image/upload?public_ids[]=';

    return this.http.delete(this.cloudinaryUrl + route + public_id)
                    .map((response: Response) => response.json())
                    .catch((error: Response) => {
                      this.errorMessageService.handleErrorMessage(error.json());
                      return Observable.throw(error.json())
                    });
  }
}
