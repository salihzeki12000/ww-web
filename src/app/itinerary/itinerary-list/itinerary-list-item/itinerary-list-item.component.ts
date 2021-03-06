import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ItineraryService } from '../../itinerary.service';
import { UserService }      from '../../../user';
import { LoadingService}    from '../../../loading';

@Component({
  selector: 'ww-itinerary-list-item',
  templateUrl: './itinerary-list-item.component.html',
  styleUrls: ['./itinerary-list-item.component.scss']
})
export class ItineraryListItemComponent implements OnInit {
  @Input() itinerary;
  @Input() user;
  @Input() viewUser;

  displayPic = '';
  copied = false;
  like = false;
  save = false;
  member = false;
  creator = false;
  publish = false;
  followings = [];

  constructor(
    private userService: UserService,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService,
    private router: Router) { }

  ngOnInit() {
    this.loadingService.setLoader(true,"");

    if(this.itinerary.description.photos.length > 0)  {
      this.displayPic = this.itinerary.description.photos[0];
    }

    setTimeout(() =>  {
      this.checkMember();
      this.checkCopy();
      this.checkLike();
      this.checkSave();
      this.checkPublish();
      this.loadingService.setLoader(false,"");
    },2000)
  }

  checkCopy() {
    for (let i = 0; i < this.itinerary['copied_by'].length; i++) {
      if(this.itinerary['copied_by'][i]['user'] === this.user['_id'])  {
        this.copied = true;
      }
    }

    this.followings = this.itinerary['following'];
    if(this.followings) this.removeCreator();
    delete this.itinerary['following'];
  }

  checkLike()  {
    for (let i = 0; i < this.itinerary['likes'].length; i++) {
      if(this.itinerary['likes'][i] === this.user['_id'])  {
        this.like = true;
        break;
      };
    }
  }

  checkSave()  {
    for (let i = 0; i < this.user['saves']['itineraries'].length; i++) {
      if(this.user['saves']['itineraries'][i]['_id'] === this.itinerary['_id'])  {
        this.save = true;
        break;
      };
    }
  }

  checkMember() {
    for (let i = 0; i < this.itinerary['members'].length; i++) {
      if(this.itinerary['members'][i]['_id'] === this.user['_id'])  {
        this.member = true;
        break;
      };
    }
  }

  checkPublish()  {
    if(this.itinerary['corporate']['status'] && this.itinerary['corporate']['publish']) {
      this.publish = true;
    }
  }

  removeCreator() {
    for (let i = 0; i < this.followings.length; i++) {
      if(this.followings[i]['_id'] === this.itinerary['created_by']['_id'])  {
        this.creator = true;
        this.followings.splice(i,1);
        break;
      }
    }
  }

  toggleLike()  {
    this.like = !this.like;

    if(this.like) {
      this.itinerary['likes'].push(this.user['_id'])
    } else  {
      let index = this.itinerary['likes'].indexOf(this.user['_id']);

      this.itinerary['likes'].splice(index, 1)
    }

    this.itineraryService.updateItinUser(this.itinerary).subscribe(
      result => {})
  }

  toggleSave()  {
    this.save = !this.save;

    if(this.save) {
      this.user['saves']['itineraries'].push(this.itinerary);
    } else  {
      let itineraries = this.user['saves']['itineraries'];

      for (let i = 0; i < itineraries.length; i++) {
        if(itineraries[i]['_id'] === this.itinerary['_id'])  {
          this.user['saves']['itineraries'].splice(i, 1);
          break;
        }
      }
    }

    this.userService.editUser(this.user).subscribe(
      result => {})
  }

  routeToItin() {
    if(this.member) {
      this.router.navigateByUrl('/me/itinerary/' + this.itinerary['_id'])
    } else if(this.publish) {
      this.router.navigateByUrl('/preview/itinerary/' + this.itinerary['_id'])
    } else if(this.creator) {
      this.router.navigateByUrl('/wondererwanderer/' + this.itinerary['created_by']['_id'] + '/itinerary/' + this.itinerary['_id'])
    } else if (this.viewUser) {
      this.router.navigateByUrl('/wondererwanderer/' + this.viewUser['_id'] + '/itinerary/' + this.itinerary['_id'])
    } else {
      this.router.navigateByUrl('/wondererwanderer/' + this.itinerary['created_by']['_id'] + '/itinerary/' + this.itinerary['_id'])
    }
  }

  routeToUser(id) {
    if(id === this.user['_id']) {
      this.router.navigateByUrl('/me/home');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
