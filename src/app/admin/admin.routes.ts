import { Routes } from "@angular/router";


import { AdminVerifyComponent }         from './admin-verify/admin-verify.component';
import { AdminAttractionComponent }     from './admin-attraction/admin-attraction.component';
import { AdminAttractionFormComponent } from './admin-attraction/admin-attraction-form/admin-attraction-form.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'verify/:token/:id', component: AdminVerifyComponent },
  { path: 'attraction-new', component: AdminAttractionFormComponent },
  { path: 'attraction', component: AdminAttractionComponent }
]
