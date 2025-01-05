import { Component } from '@angular/core';
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
  activeTab: number = 0; 

  clearMessage() {
    this.message = null;
  }

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    window.location.href = '/login';
  }   

  tabs = [
    { label: 'Cambre Services' },
    { label: 'Agence Cambre' }
  ];

  selectTab(index: number): void {
    this.activeTab = index; 
  }
}