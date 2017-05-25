import { NgModule }                         from '@angular/core';
import { BrowserAnimationsModule }          from '@angular/platform-browser/animations'
import { CommonModule }                     from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule }                       from '@angular/http';
import { RouterModule }                     from '@angular/router';
import { SharedModule }                     from '../shared'


import { ItineraryComponent }              from './itinerary.component';
import { AccommodationComponent }          from './itinerary-events/itinerary-accommodation/accommodation/accommodation.component'
import { AccommodationFormComponent }      from './itinerary-events/itinerary-accommodation/accommodation-form/accommodation-form.component'
import { ItineraryAccommodationComponent } from './itinerary-events/itinerary-accommodation/itinerary-accommodation.component'

import { TransportComponent }              from './itinerary-events/itinerary-transport/transport/transport.component'
import { TransportFormComponent }          from './itinerary-events/itinerary-transport/transport-form/transport-form.component'
import { ItineraryTransportComponent }     from './itinerary-events/itinerary-transport/itinerary-transport.component'

import { ActivityComponent }               from './itinerary-events/itinerary-activity/activity/activity.component'
import { ActivityListComponent }           from './itinerary-events/itinerary-activity/activity-list/activity-list.component'
import { ActivityInputComponent }          from './itinerary-events/itinerary-activity/activity-input/activity-input.component'
import { ItineraryActivityComponent }      from './itinerary-events/itinerary-activity/itinerary-activity.component'

import { ItineraryFormComponent }          from './itinerary-form/itinerary-form.component'
import { ItineraryListComponent }          from './itinerary-list/itinerary-list.component'
import { ItineraryAllComponent }           from './itinerary-list/itinerary-all/itinerary-all.component'
import { ItineraryPastComponent }          from './itinerary-list/itinerary-past/itinerary-past.component'
import { ItineraryUpcomingComponent }      from './itinerary-list/itinerary-upcoming/itinerary-upcoming.component'

import { ItineraryMapComponent }           from './itinerary-map/itinerary-map.component'

import { ResourceComponent }               from './itinerary-resources/resource/resource.component'
import { ResourceInputComponent }          from './itinerary-resources/resource-input/resource-input.component'
import { ResourceListComponent }           from './itinerary-resources/resource-list/resource-list.component'
import { ItineraryResourcesComponent }     from './itinerary-resources/itinerary-resources.component'

import { ItinerarySettingsComponent }      from './itinerary-settings/itinerary-settings.component'
import { ItineraryShareComponent }         from './itinerary-share/itinerary-share.component'
import { ItinerarySummaryComponent }       from './itinerary-summary/itinerary-summary.component'
import { ItinerarySummaryItemComponent }   from './itinerary-summary/itinerary-summary-item/itinerary-summary-item.component'

import { ItineraryPrintComponent }                from './itinerary-print/itinerary-print.component'
import { ItineraryPrintDatePreviewComponent }     from './itinerary-print/itinerary-print-date-preview.component'
import { ItineraryPrintCategoryPreviewComponent } from './itinerary-print/itinerary-print-category-preview.component'
import { ItineraryPrintCategoryComponent }        from './itinerary-print/itinerary-print-category/itinerary-print-category.component'
import { ItineraryPrintDateComponent }            from './itinerary-print/itinerary-print-date/itinerary-print-date.component'

@NgModule({
  declarations: [
    ItineraryComponent,
    AccommodationComponent,
    AccommodationFormComponent,
    ItineraryAccommodationComponent,
    TransportComponent,
    TransportFormComponent,
    ItineraryTransportComponent,
    ActivityComponent,
    ActivityListComponent,
    ActivityInputComponent,
    ItineraryActivityComponent,
    ItineraryFormComponent,
    ItineraryListComponent,
    ItineraryAllComponent,
    ItineraryPastComponent,
    ItineraryUpcomingComponent,
    ItineraryMapComponent,
    ResourceComponent,
    ResourceInputComponent,
    ResourceListComponent,
    ItineraryResourcesComponent,
    ItinerarySettingsComponent,
    ItineraryShareComponent,
    ItinerarySummaryComponent,
    ItinerarySummaryItemComponent,
    ItineraryPrintComponent,
    ItineraryPrintDatePreviewComponent,
    ItineraryPrintCategoryPreviewComponent,
    ItineraryPrintCategoryComponent,
    ItineraryPrintDateComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule
  ],
})
export class ItineraryModule {}
