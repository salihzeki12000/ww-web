import { Component, OnInit, OnDestroy, Renderer2, ElementRef, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Ng2DeviceService } from 'ng2-device-detector';
import { Title }            from '@angular/platform-browser';
import { Subscription }     from 'rxjs/Rx';

import { Router } from '@angular/router';

import { User, UserService }    from '../user';
import { LoadingService }       from '../loading';
import { RelationshipService }  from '../relationships';
import { FavouriteService }     from '../favourite';
import { FlashMessageService }  from '../flash-message';
import { FileuploadService }    from '../shared';

@Component({
  selector: 'ww-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  user;
  desktop = true;

  relationshipSubscription: Subscription;
  followings = [];
  followers = [];
  pendingFollowers = [];

  favSubscription: Subscription;
  favs = [];

  verifyMsg = false;

  newUser = false;
  newItinerary = true;
  curated = false;
  follow = false;
  fixed = false;

  currentUserSubscription: Subscription;
  feedSubscription: Subscription;

  showItineraryForm = false;

  descriptionForm: FormGroup;
  addDescription = false;

  inputValue = '';
  fileTypeError = false;
  newProfilePic;
  newImageFile = '';

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private element: ElementRef,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private relationshipService: RelationshipService,
    private loadingService: LoadingService,
    private favouriteService: FavouriteService,
    private fileuploadService: FileuploadService,
    private flashMessageService: FlashMessageService,
    private deviceService: Ng2DeviceService,
    private router: Router) {
      this.descriptionForm = this.formBuilder.group({
        'description': ''
      })
    }

  ngOnInit() {
    this.loadingService.setLoader(true, "");
    this.titleService.setTitle("Home");

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.user = result;

        this.favouriteService.getFavs(this.user['_id']).subscribe(result =>{})


        if(!this.user['new_user_tour'])  {
          this.newUser = true;
          this.verifyMsg = true;
          this.preventScroll(true);
        } else  {
          this.preventScroll(false);
        }
      })

    this.relationshipSubscription = this.relationshipService.updateRelationships.subscribe(
      result => {
        this.followers = Object.keys(result['followers']).map(key => result['followers'][key]);
        this.followings = Object.keys(result['followings']).map(key => result['followings'][key]);
        this.pendingFollowers = Object.keys(result['pendingFollowers']).map(key => result['pendingFollowers'][key]);;
      })

    this.favSubscription = this.favouriteService.updateFavs.subscribe(
      result => {
        this.favs = Object.keys(result).map(key => result[key]);
      })

    this.loadingService.setLoader(false, "");

    // https://github.com/KoderLabs/ng2-device-detector/blob/master/src/ng2-device.constants.ts
    let deviceInfo = this.deviceService.getDeviceInfo();

    let device = deviceInfo['device'];
    if(device !== 'chrome-book' && device !== 'unknown')  {
      this.desktop = false;
    }
  }

  @HostListener('window:scroll', ['$event'])
  checkScroll(event) {
    let offset = this.element.nativeElement.ownerDocument.scrollingElement.scrollTop;
    let navPos = this.element.nativeElement.children[0].children[3].offsetTop - 100;

    if(offset > navPos)  {
      this.fixed = true;
    } else  {
      this.fixed = false;
    }
  }


  ngOnDestroy() {
    if(!this.user['new_user_tour']) {
      this.updateUser();
    }

    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();

    this.loadingService.setLoader(true, "");
  }


  // tour related

  updateUser()  {
    this.user['new_user_tour'] = true;
    this.userService.editUser(this.user).subscribe(result =>{})
  }

  end()  {
    this.newUser = false;
    this.preventScroll(false);
    this.updateUser();
  }

  getCurated()  {
    this.newItinerary = false;
    this.curated = true;
  }

  getFollow() {
    this.curated = false;
    this.follow = true;
  }

  // change profile pic

  fileUploaded(event) {
    let file = event.target.files[0];
    let type = file['type'].split('/')[0]

    if (type !== 'image') {
      this.fileTypeError = true;
    } else  {
      if(event.target.files[0]) {
        this.newImageFile = event.target.files[0];
        let reader = new FileReader();

        reader.onload = (event) =>  {
          this.newProfilePic = event['target']['result'];
        }

        reader.readAsDataURL(event.target.files[0]);
        return;
      }
    }
  }

  saveProfilePic()  {
    this.loadingService.setLoader(true, "Saving your profile picture...");

    this.fileuploadService.uploadProfile(this.newImageFile).subscribe(
      result => {
        this.user['display_picture'] = {
          url: result.secure_url,
          public_id: result.public_id
        }
        this.updateProfile();
    })
  }

  updateProfile() {
    this.userService.editUser(this.user).subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);

        this.cancelChangePicture();
      })
  }

  cancelChangePicture()  {
    this.inputValue = null;
    this.newProfilePic = '';
    this.newImageFile = '';
  }


  // add description

  getDescription()  {
    this.addDescription = true;
    this.preventScroll(true);
  }

  cancelDescription() {
    this.addDescription = false;
    this.descriptionForm.reset();
    this.preventScroll(false);
  }

  saveDescription(text) {
    this.user['description'] = this.descriptionForm.value.description;

    this.userService.editUser(this.user).subscribe(
      result =>{})

    this.cancelDescription();
  }

  // itinerary related

  createItinerary() {
    this.showItineraryForm = true;
    this.preventScroll(true);
  }

  hideItineraryForm(hide) {
    this.showItineraryForm = false;
    this.preventScroll(false);
  }

  routeToItin(id) {
    this.router.navigateByUrl('/me/itinerary/' + id);
  }

  routeToPreview(id) {
    this.router.navigateByUrl('/preview/itinerary/' + id);
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
