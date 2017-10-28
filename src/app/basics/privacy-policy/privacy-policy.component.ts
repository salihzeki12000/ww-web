import { Component, OnInit } from '@angular/core';
import { Title }  from '@angular/platform-browser';

import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(
    private titleService: Title,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.titleService.setTitle("Privacy Policy");

    this.loadingService.setLoader(false, "");
  }

}
