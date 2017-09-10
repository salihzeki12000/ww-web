import { Routes } from "@angular/router";

import { AdminFormComponent }           from './admin-form/admin-form.component';
import { AdminAttractionComponent }     from './admin-attraction/admin-attraction.component';
import { AdminAttractionFormComponent } from './admin-attraction/admin-attraction-form/admin-attraction-form.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'admin-new', component: AdminFormComponent },
  { path: 'attraction-new', component: AdminAttractionFormComponent },
  { path: 'attraction', component: AdminAttractionComponent }
]
