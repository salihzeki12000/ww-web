import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ww-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  showAddNew = false;
  
  constructor() { }

  ngOnInit() {
  }

  showAddNewOptions() {
    this.showAddNew = true;
  }

}
