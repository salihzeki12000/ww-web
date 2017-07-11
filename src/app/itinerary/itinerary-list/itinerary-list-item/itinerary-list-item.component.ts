import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ww-itinerary-list-item',
  templateUrl: './itinerary-list-item.component.html',
  styleUrls: ['./itinerary-list-item.component.scss']
})
export class ItineraryListItemComponent implements OnInit {
  @Input() itinerary;
  @Input() currentUser;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
