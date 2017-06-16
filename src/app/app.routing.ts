import { Routes, RouterModule } from '@angular/router';

import { AdminComponent, ADMIN_ROUTES } from './admin';
import { LandingPageComponent } from './landing-page';
import { MeComponent, HOME_ROUTES } from './me';
import { UserComponent, USER_ROUTES } from './user';
import { ItineraryPrintDatePreviewComponent, ItineraryPrintCategoryPreviewComponent } from './itinerary';
import { PrivacyPolicyComponent } from './privacy-policy';

import { AuthGuard } from './_guards/auth.guard';

const APP_ROUTES: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'admin', component: AdminComponent, children: ADMIN_ROUTES },
  { path: 'me', component: MeComponent, children: HOME_ROUTES, canActivate: [AuthGuard] },
  { path: 'wondererwanderer/:id', component: UserComponent, children: USER_ROUTES, canActivate: [AuthGuard] },
  { path: 'print-date', component: ItineraryPrintDatePreviewComponent, canActivate: [AuthGuard] },
  { path: 'print-category', component: ItineraryPrintCategoryPreviewComponent, canActivate: [AuthGuard] },
]

export const routing = RouterModule.forRoot(APP_ROUTES, { useHash: true })
