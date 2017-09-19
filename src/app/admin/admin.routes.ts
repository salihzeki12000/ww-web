import { Routes } from "@angular/router";

import { AdminFormComponent }              from './admin-form/admin-form.component';
import { AdminCitiesComponent }            from './admin-cities/admin-cities.component';
import { AdminCountriesComponent }         from './admin-countries/admin-countries.component';
import { AdminAttractionComponent }        from './admin-attraction/admin-attraction.component';
import { AdminAttractionFormComponent }    from './admin-attraction/admin-attraction-form/admin-attraction-form.component';
import { PlacesComponent, PlaceComponent } from '../places';

export const ADMIN_ROUTES: Routes = [
  { path: 'admin-new', component: AdminFormComponent },
  { path: 'attraction-new', component: AdminAttractionFormComponent },
  { path: 'attraction', component: AdminAttractionComponent },
  { path: 'cities', component: AdminCitiesComponent },
  { path: 'countries', component: AdminCountriesComponent },
  { path: 'places', component: PlacesComponent },
  { path: 'place/:id', component: PlaceComponent }
]
