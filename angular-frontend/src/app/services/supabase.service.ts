import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  equipments: any[] = [];
  houses: any[] = [];
  addressColumns: string[] = ['street', 'city'];
  equipmentColumns: string[] = ['name', 'image'];

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }

  // Material table methods
  async getMaterials() {
    const { data, error } = await this.supabase
      .from('material')
      .select('*')
      .order('name_dutch', {ascending: true}); 
    if (error) throw error;
    return data;
  }

  async addMaterial(material: any) {
    const timestamp = new Date().toISOString();
    
    const { data: user, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User is not authenticated');
    }  
    const { data, error: insertError } = await this.supabase.from('material').insert([
      {
        ...material,
        user_id: user.user.id, 
        createdon: timestamp,
        lastupdatedon: timestamp,
      },
    ]);
  
    if (insertError) throw insertError;
    return data;
  }

  async updateMaterial(id: string, updates: any) {
    const timestamp = new Date().toISOString();
  
    const { data: user, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User is not authenticated');
    }
    const { data, error: updateError } = await this.supabase
      .from('material')
      .update({
        ...updates,
        lastupdatedon: timestamp,
      })
      .eq('id', id)
      .eq('user_id', user.user.id);
  
    if (updateError) throw updateError;
    return data;
  }

  async deleteMaterial(id: string) {
    const { data: user, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User is not authenticated');
    }

    const { data, error: deleteError } = await this.supabase
      .from('material')
      .update({
        deleted: true,
        lastupdatedon: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id); 
  
    if (deleteError) throw deleteError;
    return data;
  }

  // Equipments table methods
  async fetchEquipments() {
    try {
      const { data, error } = await this.supabase
        .from('equipments') 
        .select('id, name, image_path');

      if (error) {
        console.error('Error fetching equipments:', error);
        return;
      }

      // Generate public URLs for images
      this.equipments = data.map((equipment) => ({
        ...equipment,
        imageUrl: this.supabase.storage
          .from(environment.supabaseStorage.iconBucket) 
          .getPublicUrl(equipment.image_path).data.publicUrl,
      }));
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    }
  }

  // Houses table methods
  async fetchHouses() {
    try {
      const { data: houses, error } = await this.supabase
        .from('housing') 
        .select('id, name, type, image_path');

      if (error) {
        console.error('Error fetching houses:', error);
        return [];
      }

      // Generate public URLs for house images
      return houses.map((house) => ({
        ...house,
        imageUrl: this.supabase.storage
          .from(environment.supabaseStorage.bucket) 
          .getPublicUrl(house.image_path).data.publicUrl,
      }));
    } catch (error) {
      console.error('Error fetching houses:', error);
      return [];
    }
  }

  // Addresses table methods
  async fetchAddresses() {
    try {
      const { data: addresses, error } = await this.supabase
        .from('address') 
        .select('id, house_id, street, city');

      if (error) {
        console.error('Error fetching addresses:', error);
        return [];
      }

      return addresses;
    } catch (error) {
      console.error('Error fetching address data:', error);
      return [];
    }
  }

  // Method to fetch houses with their addresses
  async fetchHousesWithAddresses() {
    try {
      const houses = await this.fetchHouses();
      const addresses = await this.fetchAddresses();

      // Combine houses with their addresses
      this.houses = houses.map((house) => ({
        ...house,
        addresses: addresses.filter((address) => address.house_id === house.id),
      }));

      return this.houses;
    } catch (error) {
      console.error('Error fetching houses with addresses:', error);
      return [];
    }
  }
}
