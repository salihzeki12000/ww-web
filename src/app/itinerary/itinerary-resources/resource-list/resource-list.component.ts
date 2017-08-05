import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { Title }        from '@angular/platform-browser';

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
  preview;

  updateResourcesSubscription: Subscription;
  resources = [];
  filteredResources = [];

  totalResources = 1;
  categories = ['See all', 'Food', 'Accommodation', 'Transport', 'Activity'];
  selectedCategory = "See all";

  currentItinerarySubscription: Subscription;
  currentItinerary;

  showResourceSummary = false;
  highlightedEvent;

  addResource = false;

  constructor(
    private titleService: Title,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private itineraryService: ItineraryService,
    private resourceService: ResourceService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') this.preview = true;

    this.updateResourcesSubscription = this.resourceService.updateResources.subscribe(
     result => {
       this.resources = Object.keys(result).map(key => result[key]);
       this.filteredResources = this.resources;
       this.totalResources = this.resources.length;
     })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result => {
        this.currentItinerary = result;
        let title = this.currentItinerary['name'] + " | Resource"
        this.titleService.setTitle(title);
      })

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

  filter(c)  {
    if(c === "See all") {
      this.filteredResources = this.resources;
    } else  {
      this.filteredResources = Object.assign([], this.resources).filter(
        resource => resource.category === c
      )
    }
  }

  hideResourceForm()  {
    this.addResource = false;
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
