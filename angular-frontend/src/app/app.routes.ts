import { Routes } from '@angular/router';
import { UserComponent } from './components/user/user.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { VerhuurComponent } from './components/verhuur/verhuur.component';
import { LakensComponent } from './components/lakens/lakens.component';
import { CambreServicesComponent } from './components/cambre-services/cambre-services.component';
import { AgenceCambreComponent } from './components/agence-cambre/agence-cambre.component';
import { EditPropertiesComponent } from './components/edit-properties/edit-properties.component';
import { EditEquipmentsComponent } from './components/edit-equipments/edit-equipments.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent }, 

  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'cambre-services', component: CambreServicesComponent },
      { 
        path: 'agence-cambre', 
        component: AgenceCambreComponent,
        children: [
          { path: 'properties', component: EditPropertiesComponent }, 
          { path: 'equipments', component: EditEquipmentsComponent }  
        ]
      },
      { path: '', redirectTo: 'cambre-services', pathMatch: 'full' }
    ]
  },

  { path: 'rental', component: VerhuurComponent }, 
  { path: 'sheets', component: LakensComponent }, 

  { path: '', redirectTo: '/sheets', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/sheets' }, 
];