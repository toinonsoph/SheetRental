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
      // Fetch housing data
      const { data: houses, error } = await this.supabase
        .from('housing')
        .select('id, name, totalpersons, typebase: typeid (name), price, totalrooms, addressid, url');
  
      if (error) {
        console.error('Error fetching houses:', error);
        return [];
      }
  
      // Fetch all image files from the storage bucket
      const { data: imageFiles, error: storageError } = await this.supabase.storage
        .from(environment.supabaseStorage.bucket)
        .list('');
  
      if (storageError) {
        console.error('Error fetching images from storage bucket:', storageError);
        return houses.map((house) => ({ ...house, imageUrl: null }));
      }
  
      // Fetch all icons from the storage bucket
      const { data: iconFiles, error: iconError } = await this.supabase.storage
        .from('icons') // Replace 'icons' with your actual bucket name if needed
        .list('');
  
      if (iconError) {
        console.error('Error fetching icons from storage bucket:', iconError);
        return houses.map((house) => ({ ...house, equipmentIcons: [] }));
      }
  
      // Fetch all equipment data
      const { data: equipments, error: equipmentsError } = await this.supabase
        .from('equipment')
        .select('id, name');
  
      if (equipmentsError) {
        console.error('Error fetching equipments:', equipmentsError);
        return houses.map((house) => ({ ...house, equipmentIcons: [] }));
      }
  
      // Create a mapping of equipment IDs to their names
      const equipmentMap = new Map(equipments.map((equipment) => [equipment.id, equipment.name]));
  
      // Fetch house equipment data
      const { data: houseEquipments, error: houseEquipmentError } = await this.supabase
        .from('housingequipment')
        .select('housingid, equipmentid');
  
      if (houseEquipmentError) {
        console.error('Error fetching house equipments:', houseEquipmentError);
        return houses.map((house) => ({ ...house, equipmentIcons: [] }));
      }
  
      const normalizeString = (str: string): string =>
        str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_')
          .toLowerCase();
  
      // Map houses with their corresponding images and equipment icons
      return houses.map((house) => {
        const normalizedHouseName = normalizeString(house.name);
  
        // Find the matching image file for the house
        const matchingImage = imageFiles?.find((file) =>
          normalizeString(file.name).includes(normalizedHouseName)
        );
  
        // Get all equipment IDs for the current house
        const equipmentIds = houseEquipments
          .filter((equipment) => equipment.housingid === house.id)
          .map((equipment) => equipment.equipmentid);
  
        // Map IDs to names using the equipmentMap
        const equipmentNames = equipmentIds.map((id) => equipmentMap.get(id));
  
        // Map equipment to their corresponding icons
        const equipmentIcons = equipmentNames.map((equipmentName) => {
          const normalizedName = normalizeString(equipmentName || '');
          const matchingIcon = iconFiles?.find((file) =>
            normalizeString(file.name).includes(normalizedName)
          );
  
          return {
            name: equipmentName,
            url: matchingIcon
              ? this.supabase.storage
                  .from('icons')
                  .getPublicUrl(matchingIcon.name).data.publicUrl
              : null, // Default to null if no matching icon is found
          };
        });
  
        return {
          ...house,
          propertyType: house.typebase || '',
          imageUrl: matchingImage
            ? this.supabase.storage
                .from(environment.supabaseStorage.bucket)
                .getPublicUrl(matchingImage.name).data.publicUrl
            : null,
          equipmentIcons: equipmentIcons.sort((a, b) => a.name.localeCompare(b.name)), // Sort icons alphabetically
        };
      });
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
        .select('id, street, city');

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
        address: addresses.find((address) => address.id === house.address_id),
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

    const { data, error } = await this.supabase.from('housing').insert([
      {
        id,
        ...property,
        createdon: timestamp,
        lastupdatedon: timestamp,
      },
    ]);

    if (error) throw error;
    return data;
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