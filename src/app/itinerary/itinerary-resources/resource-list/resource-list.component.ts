import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
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
  resources = [];
  totalResources = 1;

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showResourceSummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer2,
    private itineraryService: ItineraryService,
    private resourceService: ResourceService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.updateResourcesSubscription = this.resourceService.updateResources.subscribe(
                                             result => {
                                               this.resources = Object.keys(result).map(key => result[key]);
                                               this.totalResources = this.resources.length;
                                             })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => { this.currentItinerary = result; })

    this.loadingService.setLoader(false, "");
    this.preventScroll(false);
  }

  ngOnDestroy() {
    this.updateResourcesSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
    this.loadingService.setLoader(true, "");
  }

  showSummary() {
    this.showResourceSummary = !this.showResourceSummary;
    this.preventScroll(this.showResourceSummary);
  }

  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  centerItem(resource)  {
    this.showResourceSummary = false;
    this.preventScroll(false);

    this.highlightedEvent = resource;
  }

}
