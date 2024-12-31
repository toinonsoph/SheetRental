import { Routes } from '@angular/router';
import { UserComponent } from './components/user/user.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, 
  },
  {
    path: 'user',
    component: UserComponent, 
    canActivate: [AuthGuard], 
  },
  {
    path: '',
    redirectTo: '/login', 
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login', 
  },
];
