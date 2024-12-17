import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import { LakensComponent } from './components/lakens/lakens.component';
import { VerhuurComponent } from './components/verhuur/verhuur.component';
import { AdditionalInfoComponent } from './components/additional-info/additional-info.component';


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    LakensComponent,
    VerhuurComponent,
    AdditionalInfoComponent
  ],
})
export class AppComponent {
  links = [
    { id: 'lakens', label: 'Lakens / Draps / Bettwâsche' },
    { id: 'verhuur', label: 'Vakantiewoningen / Location de maisons de vacances / Vermietung von Ferienhäuser' },
  ];

  activeLink = this.links[0].id;
}
