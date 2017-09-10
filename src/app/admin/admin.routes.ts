import { Routes } from "@angular/router";

import { AdminAttractionComponent }     from './admin-attraction/admin-attraction.component';
import { AdminAttractionFormComponent } from './admin-attraction/admin-attraction-form/admin-attraction-form.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'attraction-new', component: AdminAttractionFormComponent },
  { path: 'attraction', component: AdminAttractionComponent }
]
