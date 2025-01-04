import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  // Material table methods
  async getMaterials() {
    const { data, error } = await this.supabase
      .from('materials')
      .select('*'); 
    if (error) throw error;
    return data;
  }

  async addMaterial(material: any) {
    const timestamp = new Date().toISOString();
    const { data, error } = await this.supabase.from('materials').insert([
      {
        ...material, 
        createdOn: timestamp,
        lastUpdateOn: timestamp,
      },
    ]);
    if (error) throw error;
    return data;
  }

  async updateMaterial(id: string, updates: any) {
    const timestamp = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('materials')
      .update({
        ...updates,
        lastUpdateOn: timestamp,
      })
      .eq('id', id); 
    if (error) throw error;
    return data;
  }

  async deleteMaterial(id: string) {
    const { data, error } = await this.supabase
      .from('materials')
      .delete()
      .eq('id', id); 
    if (error) throw error;
    return data;
  }
}
