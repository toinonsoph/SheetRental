import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent {
  message: string | null = '';
  links = [
    { label: 'Cambre Services', path: '/cambre-services' },
    { label: 'Agence Cambre', path: '/agence-cambre' },
  ];
  activeLink = this.links[0].label;

  constructor(
    private http: HttpClient
  ) {}

  setActiveLink(link: string) {
    this.activeLink = link;
  }

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
}