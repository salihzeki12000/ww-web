import { Component, OnInit, Renderer2 } from '@angular/core';
import { Title }        from '@angular/platform-browser';

import { LoadingService}  from '../loading';
import { AdminService }   from './admin.service';

@Component({
  selector: 'ww-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  admin;
  username;

  addNewAdmin = false;

  showAddNew = false;

  // toggle show in mobile
  showNav = false;
  currentRoute = '';

  constructor(
    private titleService: Title,
    private adminService: AdminService,
    private renderer: Renderer2,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingService.setLoader(false, "");
    this.titleService.setTitle("Admin Home");

    this.adminService.getCurrentAdmin().subscribe(
      result => {
        this.admin = result.admin;
        this.username = this.admin['email'].split('@')[0]
      }
    )
  }

  showAddNewOptions() {
    this.showAddNew = true;

    this.showNav = false;
    this.preventScroll(true);
  }

  cancelAddNewOptions() {
    this.showAddNew = false;
    this.preventScroll(false);
  }



  // to close any open modal when navigate to child routes
  activateTab(route) {
    if(route !== '')  {
      this.currentRoute = route;
    }

    this.showNav = false;
    this.showAddNew = false;
    this.preventScroll(false);
  }


  // to toggle nav and close any open modal in mobile < 420px
  toggleNav() {
    this.showNav = !this.showNav;

    if(this.showNav)  {
      this.showAddNew = false;
    }
  }



  hideAdminForm() {
    this.addNewAdmin = false;
  }




  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }
}
