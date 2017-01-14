import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { User, UserService, FollowingService } from '../../user';
import { ItineraryService, ItineraryEventService } from '../../itinerary';
import { AuthService } from '../../auth';

@Component({
  selector: 'ww-side-navigation',
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit {
  currentUser: User;
  currentUserSubscription: Subscription;

  itineraryForm: FormGroup;
  itinerariesSubscription: Subscription;

  users: User[] = [];
  showUsers = false;

  followers = [];
  followings = [];
  requests = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private itineraryEventService: ItineraryEventService,
    private followingService: FollowingService,
    private itineraryService: ItineraryService
  ) {
      this.itineraryForm = this.formBuilder.group({
        'name': ['', Validators.required],
        'dateFrom': ['', Validators.required],
        'dateTo': ['', Validators.required]
      });
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         data => {
                                           this.currentUser = data;
                                           this.getFollowings();
                                         }
                                       )

    this.itinerariesSubscription = this.itineraryService.updateItineraries
                                    .subscribe(
                                      result => {
                                        this.handleItinChange(result)
                                      })

    this.userService.getAllUsers()
        .subscribe(
          data => {
            this.users = data.users;
          }
        )
  }

  getFollowings() {
    this.followingService.getRelationships()
        .subscribe(
          data => {
            this.filterFollowers(data.followings);
          }
        )
  }

  filterFollowers(relationship) {
    this.followings = [];
    this.followers = [];
    this.requests = [];

    for (let i = 0; i < relationship.length; i++) {
      if(relationship[i]['user'] === this.currentUser['id']) {
        this.followings.push(relationship[i]);
      }
      if(relationship[i]['following'] === this.currentUser['id']) {
        if(relationship[i]['status'] === 'requested')  {
          this.requests.push(relationship[i])
        } else  {
          this.followers.push(relationship[i]);
        }
      }
    }
    this.groupUsers();
  }

  groupUsers()  {
    if(this.followings.length === 0) {
      for (let i = 0; i < this.users.length; i++) {
        this.users[i]['status'] = '';
      }
    }
    if(this.followings.length > 0 )  {
      for (let i = 0; i < this.users.length; i++) {
        for (let j = 0; j < this.followings.length; j++) {
          if(this.users[i]['_id'] !== this.followings[j]['following']) {
            this.users[i]['status'] = '';
          }
          if(this.users[i]['_id'] === this.followings[j]['following'])  {
            if(this.followings[j]['status'] === 'requested') {
              this.users[i]['status'] = 'requested';
            } else  {
              this.users[i]['status'] = 'following';
            }
          }
        }
      }
    }
  }

  handleItinChange(result)  {
    let method = result['method'];
    let userItineraries = this.currentUser['itineraries'];

    if(method === 'add')  {
      userItineraries.push({
        _id: result['_id'],
        name: result['name'],
        dateFrom: result['dateFrom'],
        dateTo: result['dateTo']
      });
    } else if (method === 'edit') {
      for (let i = 0; i < userItineraries.length; i++) {
        if(userItineraries[i]['_id'] === result['_id'])  {
          userItineraries[i]['name'] = result['name'],
          userItineraries[i]['dateFrom'] = result['dateFrom'],
          userItineraries[i]['dateTo'] = result['dateTo']
        }
      }
    } else if (method === 'delete') {
      for (let i = 0; i < userItineraries.length; i++) {
        if(userItineraries[i]['_id'] === result['_id'])  {
          let indexOfItin = userItineraries.indexOf(userItineraries[i]);
          userItineraries.splice(indexOfItin, 1);
        }
      }
    }
  }

  onSubmit()  {
    let itinerary = this.itineraryForm.value;

    itinerary.members = [this.currentUser['id']];

    this.itineraryService.addItin(itinerary)
        .subscribe(
          data => {
            this.router.navigate(['/me/itinerary', data.itinerary._id]);
          },
          error => console.error(error)
        );
  }

  getUsers()  {
    this.showUsers = true;
  }

  cancelShowUsers() {
    this.showUsers = false;
  }

  follow(user)  {
    user.status = 'requested';
    this.followingService.requestFollow({
      user: this.currentUser['id'],
      following: user['_id'],
      status: 'requested'
    }).subscribe(
      data => {
        console.log(data);
      }
    )
  }

  cancelRequest(user) {
    user.status = '';
  }

  logout()  {
    this.authService.logout()
  }
}
