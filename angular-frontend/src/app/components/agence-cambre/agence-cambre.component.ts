import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-agence-cambre',
  imports: [],
  templateUrl:'./agence-cambre.component.html',
  styleUrls: ['./agence-cambre.component.css'],
  standalone: true
})
export class AgenceCambreComponent {
  @Input() selectedTab!: string;
}
