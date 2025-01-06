import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  imports: 
  [
    MatTabsModule,
    RouterModule
  ],
  standalone: true
})
export class UserComponent {
  message: string | null = '';

  activeLinkIndex = -1;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url === '/user/cambre-services') {
        this.activeLinkIndex = 0;
      } else if (url === '/user/agence-cambre') {
        this.activeLinkIndex = 1;
      } else {
        this.activeLinkIndex = -1; 
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  clearMessage(): void {
    this.message = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], {
      state: { message: 'You have been logged out.' },
    });
  }
}