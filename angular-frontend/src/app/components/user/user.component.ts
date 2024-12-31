import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'], 
})
export class UserComponent implements OnInit {
  message: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { message?: string };

    if (state?.message) {
      this.message = state.message; 

      setTimeout(() => this.clearMessage(), 5000);
    }
  }

  clearMessage(): void {
    this.message = null;
  }
}
