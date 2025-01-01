import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import * as bcrypt from 'bcryptjs'; 

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('password')
        .eq('username', username)
        .single();

      if (error || !user) {
        console.error('Login failed: User not found');
        return false;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.error('Login failed: Invalid password');
        return false;
      }
      
      localStorage.setItem('supabaseToken', username);
      return true;
    } catch (err) {
      console.error('Unexpected error during login:', err);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('supabaseToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('supabaseToken');
  }
}