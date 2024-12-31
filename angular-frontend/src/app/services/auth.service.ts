import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import * as bcrypt from 'bcryptjs'; // Import bcrypt for password comparison

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
    const { data: user, error } = await this.supabase
      .from('users') 
      .select('password') 
      .eq('username', username) 
      .single(); 
  
    if (error || !user) {
      console.error('Login failed: User not found');
      return false; 
    }
  
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.error('Login failed: Invalid password');
      return false; 
    }
  
    const { data: sessionData, error: sessionError } = await this.supabase.auth.signInWithPassword({
      email: username, 
      password, 
    });
  
    if (sessionError) {
      console.error('Session creation failed:', sessionError.message);
      return false; 
    }
  
    localStorage.setItem('supabaseToken', sessionData.session?.access_token || '');
    return true; 
  }
  

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    localStorage.removeItem('supabaseToken');
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.supabase.auth.getSession();
    return !!session.data.session;
  }

  async getUser(): Promise<any> {
    const { data } = await this.supabase.auth.getUser();
    return data?.user;
  }
}