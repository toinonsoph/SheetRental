import { Component, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import { AdditionalInfoComponent } from './components/additional-info/additional-info.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    AdditionalInfoComponent,
    RouterModule
  ],
})
export class AppComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  links = [
    { id: '/sheets', label: 'Lakens / Draps / Bettwâsche' },
    { id: '/rental', label: 'Vakantiewoningen / Location de maisons de vacances / Vermietung von Ferienhäuser' },
  ];
}
