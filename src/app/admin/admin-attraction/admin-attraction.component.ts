import { Component, OnInit } from '@angular/core';

import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-admin-attraction',
  templateUrl: './admin-attraction.component.html',
  styleUrls: ['./admin-attraction.component.scss']
})
export class AdminAttractionComponent implements OnInit {

  constructor(private loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

}
