import { Component, OnInit, Renderer } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Resource } from '../resource';
import { ResourceService } from '../resource.service';

@Component({
  selector: 'ww-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {
  resources: Resource[] = [];
  updateResourcesSubscription: Subscription;

  showResourceSummary = false;
  highlightedEvent;

  constructor(
    private renderer: Renderer,
    private resourceService: ResourceService) { }

  ngOnInit() {
    this.updateResourcesSubscription = this.resourceService.updateResources
                                           .subscribe(
                                             result => {
                                               this.resources = Object.keys(result).map(key => result[key]);
                                             }
                                           )
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
