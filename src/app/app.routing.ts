import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth';
import { MeComponent, HOME_ROUTES } from './me';
// import { ProfileComponent } from './user';
// import { ItineraryComponent, ItineraryNewComponent, ITINERARY_ROUTES } from './itinerary';

const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: AuthComponent },
  { path: 'me', component: MeComponent, children: HOME_ROUTES },
  // { path: 'profile', component: ProfileComponent },
  // { path: 'newItinerary', component: ItineraryNewComponent },
  // { path: 'itinerary/:id', component: ItineraryComponent, children: ITINERARY_ROUTES }
]

export const routing = RouterModule.forRoot(APP_ROUTES)
