  import { Component, OnInit } from '@angular/core';

import { LoadingService}  from '../loading';

@Component({
  selector: 'ww-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  addNewAdmin = false;

  showAddNew = false;

  constructor(
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
  }

  showAddNewOptions() {
    this.showAddNew = true;
  }

  hideAdminForm() {
    this.addNewAdmin = false;
  }
}
