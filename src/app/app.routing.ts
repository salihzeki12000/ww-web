import { Routes, RouterModule } from '@angular/router';

import { AdminComponent, AdminLoginComponent, AdminVerifyComponent, ADMIN_ROUTES } from './admin';
import { LandingPageComponent }   from './landing-page';
import { MeComponent, ME_ROUTES } from './me';
import { PlaceDisplayComponent }  from './places';
import { ItineraryPreviewComponent,
         ItineraryInviteComponent,
         ItineraryPrintComponent,
         PREVIEW_ROUTES } from './itinerary';

import { AboutUsComponent, ContactUsComponent, PrivacyPolicyComponent, TermsOfServiceComponent } from './basics';
import { UserComponent, UserVerifyComponent, USER_ROUTES, UserUnverifiedComponent } from './user';
import { ResetComponent, ForgotPasswordComponent }           from './auth';
import { AuthGuard }  from './_guards/auth.guard';
import { AdminGuard } from './_guards/admin.guard';

const APP_ROUTES: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset/:id', component: ResetComponent },
  { path: 'verify/:token/:id', component: UserVerifyComponent },
  { path: 'account-not-verified', component: UserUnverifiedComponent },
  { path: 'me', component: MeComponent, children: ME_ROUTES, canActivate: [AuthGuard] },
  { path: 'wondererwanderer/:id', component: UserComponent, children: USER_ROUTES, canActivate: [AuthGuard] },
  { path: 'save-print/:id', component: ItineraryPrintComponent, canActivate: [AuthGuard] },
  { path: 'invite/me/:id', component: ItineraryInviteComponent },
  { path: 'place/:id', component: PlaceDisplayComponent },
  { path: 'preview', component: ItineraryPreviewComponent, children: PREVIEW_ROUTES },

  { path: 'admin', component: AdminComponent, children: ADMIN_ROUTES, canActivate: [AdminGuard] },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-verify/:token/:id', component: AdminVerifyComponent },
]

export const routing = RouterModule.forRoot(APP_ROUTES, { useHash: true })
