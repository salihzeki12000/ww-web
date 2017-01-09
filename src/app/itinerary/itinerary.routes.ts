import { Routes } from "@angular/router";

import { ItineraryAccommodationTransportComponent } from './itinerary-events/itinerary-accommodation-transport/itinerary-accommodation-transport.component';
import { ItineraryActivityComponent }               from './itinerary-events/itinerary-activity/itinerary-activity.component';
import { ItineraryResourcesComponent }              from './itinerary-resources/itinerary-resources.component';
import { ItineraryMapComponent }                    from './itinerary-map/itinerary-map.component';
// import { ItineraryResolver } from './itinerary.resolver';

export const ITINERARY_ROUTES: Routes = [
  { path: '', redirectTo: 'accommodation-transport', pathMatch: 'full' },
  { path: 'accommodation-transport', component: ItineraryAccommodationTransportComponent },
  { path: 'activities', component: ItineraryActivityComponent },
  { path: 'resources', component: ItineraryResourcesComponent },
  { path: 'map', component: ItineraryMapComponent },
]
