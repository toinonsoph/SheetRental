import { Routes } from '@angular/router';
import { UserComponent } from './components/user/user.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { VerhuurComponent } from './components/verhuur/verhuur.component';
import { LakensComponent } from './components/lakens/lakens.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent }, 
  { path: 'user', component: UserComponent, canActivate: [AuthGuard] }, 

  // Unprotected routes
  { path: 'verhuur', component: VerhuurComponent }, 
  { path: 'lakens', component: LakensComponent }, 

  // Default and fallback routes
  { path: '', redirectTo: '/lakens', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/lakens' }, 
];