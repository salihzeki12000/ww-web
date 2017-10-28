import { Component, OnInit } from '@angular/core';
import { Title }  from '@angular/platform-browser';

import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  constructor(
    private titleService: Title,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.titleService.setTitle("Contact Us");

    this.loadingService.setLoader(false, "");
  }

}
