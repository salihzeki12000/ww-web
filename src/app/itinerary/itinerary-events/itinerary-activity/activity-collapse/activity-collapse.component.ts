import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ww-activity-collapse',
  templateUrl: './activity-collapse.component.html',
  styleUrls: ['./activity-collapse.component.scss']
})
export class ActivityCollapseComponent implements OnInit {
  @Input() date;
  @Input() event;

  collapse = true;

  constructor() { }

  ngOnInit() {
  }

  toggleCollapse()  {
    this.collapse = !this.collapse;
  }


}
