import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ww-main-navigation',
  template: `
    <nav>
      <div class="logo" [routerLink]="['/me']">
        <h2>wondererwanderer</h2>
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
