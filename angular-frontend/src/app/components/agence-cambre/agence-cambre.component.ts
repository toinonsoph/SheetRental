import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-agence-cambre',
  templateUrl: './agence-cambre.component.html',
  styleUrls: ['./agence-cambre.component.css'],
  imports: 
    [
      MatTabsModule,
      RouterModule
    ],
    standalone: true
})
export class AgenceCambreComponent implements OnInit { 
   activeLinkIndex = -1;
  
    constructor(private router: Router) {}
  
    ngOnInit(): void {
      this.router.events.subscribe(() => {
        const url = this.router.url;
        if (url === './properties') {
          this.activeLinkIndex = 0;
        } else if (url === './equipments') {
          this.activeLinkIndex = 1;
        } else {
          this.activeLinkIndex = -1; 
        }
      });
    }
  
    navigateTo(route: string): void {
      this.router.navigate([route]);
    }
}