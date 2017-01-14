import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ww-main-navigation',
  template: `
    <nav>
      <div class="logo" [routerLink]="['/me']">
        <h1>W</h1>
        <div class="sub-title">
          <h2>onderer</h2>
          <h2>anderer</h2>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./main-navigation.component.scss']
})
export class MainNavigationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
