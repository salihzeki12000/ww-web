import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth';
import { MeComponent, HOME_ROUTES } from './me';
import { ItineraryPrintPreviewComponent } from './itinerary';

import { AuthGuard } from './_guards/auth.guard';

const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: AuthComponent },
  { path: 'me', component: MeComponent, children: HOME_ROUTES, canActivate: [AuthGuard] },
  { path: 'print-itinerary', component: ItineraryPrintPreviewComponent, canActivate: [AuthGuard] },
]

export const routing = RouterModule.forRoot(APP_ROUTES)
