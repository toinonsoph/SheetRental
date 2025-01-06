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

  // Material table methods
  async getMaterials() {
    const { data, error } = await this.supabase
      .from('material')
      .select('*')
      .eq('deleted', false)
      .order('name_dutch', { ascending: true });
    if (error) throw error;
    return data;
  }

  async addMaterial(material: any) {
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();

    const { data, error: insertError } = await this.supabase.from('material').insert([
      {
        id,
        ...material,
        createdon: timestamp,
        lastupdatedon: timestamp,
      },
    ]);

    if (insertError) throw insertError;
    return data;
  }

  async updateMaterial(id: string, updates: any) {
    const timestamp = new Date().toISOString();

    const { data, error: updateError } = await this.supabase
      .from('material')
      .update({
        ...updates,
        lastupdatedon: timestamp,
      })
      .eq('id', id);

    if (updateError) throw updateError;
    return data;
  }

  async deleteMaterial(id: string) {
    const { data, error: deleteError } = await this.supabase
      .from('material')
      .update({
        deleted: true,
        lastupdatedon: new Date().toISOString(),
      })
      .eq('id', id);

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

  // Address and Property methods
  async addAddress(address: any) {
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();

    const { data, error } = await this.supabase.from('address').insert([
      {
        id,
        ...address,
        createdon: timestamp,
        lastupdatedon: timestamp,
      },
    ]).select('id');

    if (error) throw error;
    return data[0].id;
  }

  async addProperty(property: any) {
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();
  
    const { data, error } = await this.supabase
      .from('housing')
      .insert([
        {
          id,
          ...property,
          createdon: timestamp,
          lastupdatedon: timestamp,
        },
      ])
      .select('*'); 
  
    if (error) throw error;
  
    if (!data || data.length === 0) {
      throw new Error('Failed to insert property.');
    }
  
    return data[0]; 
  }
  

  async updateProperty(id: string, updates: any) {
    const timestamp = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('housing')
      .update({
        ...updates,
        lastupdatedon: timestamp,
      })
      .eq('id', id);

    if (error) throw error;
    return data;
  }

  async deleteProperty(id: string) {
    const { data, error } = await this.supabase
      .from('housing')
      .update({
        deleted: true,
        lastupdatedon: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return data;
  }
}