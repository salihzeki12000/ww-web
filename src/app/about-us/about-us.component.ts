import { Component, OnInit } from '@angular/core';

import { LoadingService } from '../loading';

@Component({
  selector: 'ww-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  constructor(
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.loadingService.setLoader(false, "")
  }

}
