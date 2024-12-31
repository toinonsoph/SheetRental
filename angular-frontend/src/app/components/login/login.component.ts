import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule]
})

export class LoginComponent {
  username = '';
  password = '';
  message: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { message?: string };

    if (state?.message) {
      this.message = state.message;
    }
  }

  async login(): Promise<void> {
    const success = await this.authService.login(this.username, this.password);
    if (success) {
      this.router.navigate(['/user']); 
    } else {
      this.message = 'Invalid username or password';
    }
  }
}
