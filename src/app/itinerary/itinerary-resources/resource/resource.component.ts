import { Component, OnInit, OnDestroy, Input, Renderer2, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { Resource }            from '../resource';
import { ResourceService }     from '../resource.service';
import { FlashMessageService } from '../../../flash-message';
import { UserService }         from '../../../user';
import { LoadingService }      from '../../../loading';

@Component({
  selector: 'ww-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit, OnDestroy {
  @Input() resource;
  @Input() itinerary;
  @Input() totalResources;
  @Input() index;
  @Input() preview;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  itineraries = [];

  showMenu = false;
  copying = false;
  editing = false;
  deleteResource = false;

  editResourceForm: FormGroup;
  submitted = false;
  categories = ['', 'Food', 'Accommodation', 'Transport', 'Activity'];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private flashMessageService: FlashMessageService,
    private resourceService: ResourceService) {
      this.editResourceForm = this.formBuilder.group({
        'title': '',
        'content': '',
        'category': '',
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
        result => {
        this.currentUser = result;
        this.checkSameUser();
        this.filterItineraries();
      })

    this.resource['formatted_content'] = this.resource['content'].replace(/\r?\n/g, '<br/> ');
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("dots-menu")) {
      this.showMenu = false;
    }
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  checkSameUser() {
    if(this.currentUser['_id'] === this.resource['user']['_id']) {
      this.sameUser = true;
    } else  {
      let admin = this.itinerary['admin'];
      for (let i = 0; i < admin.length; i++) {
        if(this.currentUser['_id'] === admin[i]) {
          this.sameUser = true;
          i = admin.length;
        }
      }
    }
  }

  filterItineraries() {
    this.itineraries = [];
    for (let i = 0; i < this.currentUser['itineraries'].length; i++) {
      if(this.currentUser['itineraries'][i]['_id'] !== this.itinerary['_id'])  {
        this.itineraries.push(this.currentUser['itineraries'][i])
      }
    }
  }


  // copy section
  copy()  {
    this.copying = true;
    this.preventScroll(true);
  }

  cancelCopy()  {
    this.copying = false;
    this.preventScroll(false);
  }

  copyTo(itinerary) {
    let copiedResource = this.resource;

    delete copiedResource['_id'];
    delete copiedResource['created_at'];
    delete copiedResource['itinerary'];

    copiedResource['user'] ={
      _id: this.currentUser['_id'],
      username: this.currentUser['username'],
    }

    copiedResource['itinerary'] = itinerary;

    this.resourceService.copyResource(copiedResource).subscribe(
      result => {
        this.flashMessageService.handleFlashMessage(result.message);
      }
    )

    this.copying = false;
    this.preventScroll(false);
  }


  // edit section
  patchValue()  {
    this.editResourceForm.patchValue({
      title: this.resource['title'],
      content: this.resource['content'],
      category: this.resource['category']
    })
  }

  edit()  {
    this.patchValue()
    this.editing = true;
    this.preventScroll(true);
  }

  undoEdit()  {
    this.patchValue()
  }

  cancelEdit()  {
    this.editing = false;
    this.preventScroll(false);
  }

  saveEdit()  {
    this.submitted = true;
    this.loadingService.setLoader(true, "Saving...");

    let editedResource = this.editResourceForm.value;

    for (let value in editedResource) {
      this.resource[value] = editedResource[value];
    }

    this.resourceService.editResource(this.resource).subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.submitted = false;
    this.editing = false;
    this.preventScroll(false);
  }


  // delete section
  delete() {
    this.deleteResource = true;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteResource = false;
    this.preventScroll(false);
  }

  confirmDelete()  {
    this.resourceService.deleteResource(this.resource).subscribe(
      result => {
        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.deleteResource = false;
    this.preventScroll(false);
  }


  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/home');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
