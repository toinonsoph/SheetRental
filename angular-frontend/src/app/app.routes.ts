import { Routes } from '@angular/router';
import { UserComponent } from './components/user/user.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'user', component: UserComponent, canActivate: [AuthGuard] }, 
    { path: '', redirectTo: '/login', pathMatch: 'full' }, 
  ];