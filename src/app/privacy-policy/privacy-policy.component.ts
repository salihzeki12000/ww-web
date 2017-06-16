import { Component, OnInit } from '@angular/core';

import { LoadingService } from '../loading';

@Component({
  selector: 'ww-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(private loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

}
