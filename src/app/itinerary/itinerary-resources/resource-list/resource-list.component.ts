import { Component, OnInit, OnDestroy, Renderer } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Resource }         from '../resource';
import { ResourceService }  from '../resource.service';
import { ItineraryService } from '../../itinerary.service';
import { LoadingService }   from '../../../loading';

@Component({
  selector: 'ww-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit, OnDestroy {
  updateResourcesSubscription: Subscription;
  resources: Resource[] = [];
  totalResources = 1;

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showResourceSummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer,
    private itineraryService: ItineraryService,
    private resourceService: ResourceService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.updateResourcesSubscription = this.resourceService.updateResources.subscribe(
                                             result => {
                                               this.resources = Object.keys(result).map(key => result[key]);
                                               this.totalResources = this.resources.length
                                             })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => { this.currentItinerary = result; })

    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    this.updateResourcesSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
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
