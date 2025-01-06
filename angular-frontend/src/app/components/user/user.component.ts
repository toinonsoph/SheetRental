import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  imports: 
  [
    MatTabsModule,
    RouterModule
  ],
  standalone: true
})
export class UserComponent {
  message: string | null = ''; 

  navLinks: any[];
  activeLinkIndex = -1; 
  constructor(private router: Router) {
    this.navLinks = [
        {
            label: 'Cambre Services',
            link: '/cambre-services',
            index: 0
        }, {
            label: 'Agence Cambre',
            link: '/agence-cambre',
            index: 1
        }
    ];
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activeLinkIndex = this.navLinks.findIndex(tab => tab.link === this.router.url);
    });
  }
  
  clearMessage() {
    this.message = null;
  }

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    window.location.href = 'login';
  }  
}