import { Routes } from "@angular/router";

import { ItinerarySummaryComponent }                from './itinerary-summary/itinerary-summary.component';
import { ItineraryAccommodationComponent }          from './itinerary-events/itinerary-accommodation/itinerary-accommodation.component';
import { ItineraryTransportComponent }              from './itinerary-events/itinerary-transport/itinerary-transport.component';
import { ItineraryActivityComponent }               from './itinerary-events/itinerary-activity/itinerary-activity.component';
import { ItineraryResourcesComponent }              from './itinerary-resources/itinerary-resources.component';
import { ItineraryMapComponent }                    from './itinerary-map/itinerary-map.component';
import { ItineraryPrintComponent }                  from './itinerary-print/itinerary-print.component';
import { ItinerarySettingsComponent }               from './itinerary-settings/itinerary-settings.component';

// import { ItineraryResolver } from './itinerary.resolver';

export const ITINERARY_ROUTES: Routes = [
  { path: '', redirectTo: 'summary', pathMatch: 'full' },
  { path: 'summary', component: ItinerarySummaryComponent },
  { path: 'accommodation', component: ItineraryAccommodationComponent },
  { path: 'transport', component: ItineraryTransportComponent },
  { path: 'activity', component: ItineraryActivityComponent },
  { path: 'resource', component: ItineraryResourcesComponent },
  { path: 'map', component: ItineraryMapComponent },
  { path: 'print', component: ItineraryPrintComponent },
  { path: 'settings', component: ItinerarySettingsComponent },
]
