import { Component } from '@angular/core';
import { AgenceCambreComponent } from '../agence-cambre/agence-cambre.component';
import { CambreServicesComponent } from '../cambre-services/cambre-services.component';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  imports: 
  [
    AgenceCambreComponent, 
    CambreServicesComponent
  ],
  standalone: true
})
export class UserComponent {
  message: string | null = '';
  selectedTab: string = 'services';

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router 
  ) {}

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.cdr.detectChanges();
  }

  clearMessage() {
    this.message = null;
  }

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    this.http.post('/api/logout', {}).subscribe(
      () => {
        console.log('Session invalidated on server');
      },
      (error) => {
        console.error('Error during logout request:', error);
      }
    );
  
    this.router.navigate(['/login']);
  }
}