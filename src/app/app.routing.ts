import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth';
import { MeComponent, HOME_ROUTES } from './me';
import { ItineraryPrintPreviewComponent } from './itinerary';

const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: AuthComponent },
  { path: 'me', component: MeComponent, children: HOME_ROUTES },
  { path: 'print-itinerary', component: ItineraryPrintPreviewComponent },
]

export const routing = RouterModule.forRoot(APP_ROUTES)
