import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isAuthenticated = await this.authService.isAuthenticated();
    if (!isAuthenticated) {
      this.authService.logout(); 
      this.router.navigate(['/login'], {
        state: { message: 'Your session has expired. Please log in again.' },
      });
      return false;
    }

    return true;
  }
}