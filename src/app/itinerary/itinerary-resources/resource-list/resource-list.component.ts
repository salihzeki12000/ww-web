import { Component, OnInit, OnDestroy, Renderer } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Resource }         from '../resource';
import { ResourceService }  from '../resource.service';
import { UserService }      from '../../../user';
import { ItineraryService } from '../../itinerary.service';

@Component({
  selector: 'ww-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit, OnDestroy {
  updateResourcesSubscription: Subscription;
  resources: Resource[] = [];

  currentUserSubscription: Subscription;
  currentUser;

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showResourceSummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private resourceService: ResourceService) { }

  ngOnInit() {
    this.updateResourcesSubscription = this.resourceService.updateResources.subscribe(
                                             result => {
                                               this.resources = Object.keys(result).map(key => result[key]);
                                             })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => { this.currentUser = result; })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => { this.currentItinerary = result; })
  }

  ngOnDestroy() {
    this.updateResourcesSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
  }

  showSummary() {
    this.showResourceSummary = !this.showResourceSummary;
    this.togglePreventScroll(this.showResourceSummary);
  }

  togglePreventScroll(value)  {
    this.renderer.setElementClass(document.body, 'prevent-scroll', value);
  }

  centerItem(resource)  {
    this.showResourceSummary = false;
    this.renderer.setElementClass(document.body, 'prevent-scroll', false);

    this.highlightedEvent = resource;
  }

}
