import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth';
import { MeComponent, HOME_ROUTES } from './me';
import { ItineraryPrintDatePreviewComponent, ItineraryPrintCategoryPreviewComponent } from './itinerary';

import { AuthGuard } from './_guards/auth.guard';

const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: AuthComponent },
  { path: 'me', component: MeComponent, children: HOME_ROUTES, canActivate: [AuthGuard] },
  { path: 'print-date', component: ItineraryPrintDatePreviewComponent, canActivate: [AuthGuard] },
  { path: 'print-category', component: ItineraryPrintCategoryPreviewComponent, canActivate: [AuthGuard] },
]

export const routing = RouterModule.forRoot(APP_ROUTES, {useHash: true})
