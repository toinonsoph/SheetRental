import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { CambreServicesComponent } from '../cambre-services/cambre-services.component';
import { AgenceCambreComponent } from '../agence-cambre/agence-cambre.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  imports: 
  [
    MatTabsModule,
    CambreServicesComponent,
    AgenceCambreComponent
  ],
  standalone: true
})
export class UserComponent {
  message: string | null = ''; 
  showCambreServices: boolean = true; 
  showAgenceCambre: boolean = false; 

  constructor(
    private http: HttpClient
  ) {}

  clearMessage() {
    this.message = null;
  }

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  
    this.http.post('/api/logout', {}).subscribe({
      next: () => {
        console.log('Session invalidated on server');
      },
      error: (error) => {
        console.error('Error during logout request:', error);
      },
      complete: () => {
        console.log('Logout request completed');
        window.location.href = '/login';
      },
    });
  }

  onTabChange(event: any) {
    const selectedTabIndex = event.index;
    if (selectedTabIndex === 0) {
      this.showCambreServices = true;
      this.showAgenceCambre = false;
    } else if (selectedTabIndex === 1) {
      this.showCambreServices = false;
      this.showAgenceCambre = true;
    }
  }
}