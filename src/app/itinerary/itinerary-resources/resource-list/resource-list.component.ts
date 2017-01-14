import { Component, OnInit } from '@angular/core';
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

  constructor(private resourceService: ResourceService) { }

  ngOnInit() {
    this.updateResourcesSubscription = this.resourceService.updateResources
                                           .subscribe(
                                             result => {
                                               this.resources = Object.keys(result).map(key => result[key]);
                                             }
                                           )
  }

}
