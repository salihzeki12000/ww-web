import { Routes } from "@angular/router";

import { AdminFormComponent }       from './admin-form/admin-form.component';
import { AdminCitiesComponent }     from './admin-cities/admin-cities.component';
import { AdminCountriesComponent }  from './admin-countries/admin-countries.component';
import { AdminPlacesComponent }     from './admin-places/admin-places.component';
import { AdminPlaceComponent }      from './admin-places/admin-place/admin-place.component';
import { AdminPlaceFormComponent }  from './admin-places/admin-place-form/admin-place-form.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'admin-new', component: AdminFormComponent },
  { path: 'place-new', component: AdminPlaceFormComponent },
  // { path: 'place', component: AdminPlaceComponent },
  { path: 'cities', component: AdminCitiesComponent },
  { path: 'countries', component: AdminCountriesComponent },
  { path: 'places', component: AdminPlacesComponent },
  { path: 'place/:id', component: AdminPlaceComponent }
]
