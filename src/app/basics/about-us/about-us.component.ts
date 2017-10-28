import { Component, OnInit } from '@angular/core';
import { Title }  from '@angular/platform-browser';

import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  constructor(
    private titleService: Title,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.titleService.setTitle("About Us");

    this.loadingService.setLoader(false, "");
  }

}
