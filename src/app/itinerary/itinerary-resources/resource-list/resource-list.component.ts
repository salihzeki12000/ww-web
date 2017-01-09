import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Resource } from '../resource';
import { ResourceService } from '../resource.service';

@Component({
  selector: 'ww-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {
  resources: Resource[] = [];

  constructor(
    private resourceService: ResourceService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.resourceService.getResources(this.route.snapshot['_urlSegment'].segments[2].path)
        .subscribe(
          data => {
            this.resources = data;
          })

  }

}
