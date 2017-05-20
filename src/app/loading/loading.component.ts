import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { LoadingService } from './loading.service';
@Component({
  selector: 'ww-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  loading: boolean = true;
  loadingSubscription: Subscription;
  message = "We are fetching your data";
  constructor(private loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingSubscription = this.loadingService.updateLoading.subscribe(
      result => {
        this.loading = result['status'];

        if(result['message'] === "") {
          this.message = "We are fetching your data";
        }

        if(result['message'] !== "") {
          this.message = result['message'];
        }
      }
    )
  }

}
