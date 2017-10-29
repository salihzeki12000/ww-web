import { Component, OnInit } from '@angular/core';
import { Title }  from '@angular/platform-browser';

import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent implements OnInit {

  constructor(
    private titleService: Title,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.titleService.setTitle("Terms of Service");

    this.loadingService.setLoader(false, "");
  }

}
