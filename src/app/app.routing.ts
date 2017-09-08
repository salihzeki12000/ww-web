import { Routes, RouterModule } from '@angular/router';

import { AdminComponent, AdminLoginComponent, ADMIN_ROUTES } from './admin';
import { LandingPageComponent }         from './landing-page';
import { MeComponent, HOME_ROUTES }     from './me';
import { PrivacyPolicyComponent }       from './privacy-policy';
import { PlaceComponent }               from './place';
import { ItineraryPreviewComponent,
         ItineraryInviteComponent,
         ItineraryPrintComponent,
         PREVIEW_ROUTES } from './itinerary';

import { UserComponent, UserVerifyComponent, USER_ROUTES, UserUnverifiedComponent }   from './user';
import { ResetComponent, ForgotPasswordComponent }           from './auth';
import { AuthGuard } from './_guards/auth.guard';

const APP_ROUTES: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset/:id', component: ResetComponent },
  { path: 'verify/:token/:id', component: UserVerifyComponent },
  { path: 'account-not-verified', component: UserUnverifiedComponent },
  { path: 'me', component: MeComponent, children: HOME_ROUTES, canActivate: [AuthGuard] },
  { path: 'wondererwanderer/:id', component: UserComponent, children: USER_ROUTES, canActivate: [AuthGuard] },
  { path: 'save-print/:id', component: ItineraryPrintComponent, canActivate: [AuthGuard] },
  { path: 'invite/me/:id', component: ItineraryInviteComponent },
  { path: 'place/:id', component: PlaceComponent },
  { path: 'preview', component: ItineraryPreviewComponent, children: PREVIEW_ROUTES },
  { path: 'admin', component: AdminComponent, children: ADMIN_ROUTES },
  { path: 'admin-login', component: AdminLoginComponent },
]

export const routing = RouterModule.forRoot(APP_ROUTES, { useHash: true })
