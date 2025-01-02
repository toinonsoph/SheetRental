import { Component } from '@angular/core';
import { AgenceCambreComponent } from '../backoffice/agence-cambre/agence-cambre.component';
import { CambreServicesComponent } from '../backoffice/cambre-services/cambre-services.component';

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

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  clearMessage() {
    this.message = null;
  }
}