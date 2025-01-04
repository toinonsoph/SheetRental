import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-agence-cambre',
  templateUrl:'./agence-cambre.component.html',
  styleUrls: ['./agence-cambre.component.css'],
  imports: 
  [
      MatTabsModule
  ],
  standalone: true
})
export class AgenceCambreComponent {
  @Input() selectedTab!: string;
}
