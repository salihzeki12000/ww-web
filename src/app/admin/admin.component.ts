import { Component, OnInit } from '@angular/core';
import { Title }        from '@angular/platform-browser';

import { LoadingService}  from '../loading';
import { AdminService }   from './admin.service';

@Component({
  selector: 'ww-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  addNewAdmin = false;

  showAddNew = false;

  constructor(
    private titleService: Title,
    private adminService: AdminService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
    this.titleService.setTitle("Admin Home");

    this.adminService.getCurrentAdmin().subscribe(
      result => {
        console.log(result);
      }
    )
  }

  showAddNewOptions() {
    this.showAddNew = true;
  }

  hideAdminForm() {
    this.addNewAdmin = false;
  }
}
