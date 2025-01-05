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

  tabs = [
    { label: 'Cambre Services', component: CambreServicesComponent },
    { label: 'Agence Cambre', component: AgenceCambreComponent }
  ];
  activeTab = 0;

  selectTab(index: number): void {
    this.activeTab = index;
  }
}