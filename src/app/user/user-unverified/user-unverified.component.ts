import { Component, OnInit } from '@angular/core';
import { Title }        from '@angular/platform-browser';

import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-user-unverified',
  templateUrl: './user-unverified.component.html',
  styleUrls: ['./user-unverified.component.scss']
})
export class UserUnverifiedComponent implements OnInit {

  constructor(
    private titleService: Title,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.titleService.setTitle("Access Denied")

    this.loadingService.setLoader(false, "");
  }

}
