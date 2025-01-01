import { Component } from '@angular/core';
import { AgenceCambreComponent } from '../backoffice/agence-cambre/agence-cambre.component';
import { CambreServicesComponent } from '../backoffice/cambre-services/cambre-services.component';

@Component({
  selector: 'app-users',
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

    constructor() {
      console.log('UserComponent initialized');
    }
  

  message: string | null = '';

  tabs = [
    { title: 'Cambre Services' },
    { title: 'Agence Cambre' }
  ];

  activeTab: number = 0;

  clearMessage() {
    this.message = null;
  }

  selectTab(index: number) {
    this.activeTab = index;
  }
}