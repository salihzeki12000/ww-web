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
  displayPic = '';
  constructor(private router: Router) { }

  ngOnInit() {
    if(this.itinerary.description.photos.length > 0)  {
      this.displayPic = this.itinerary.description.photos[0];
    }
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/profile');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
