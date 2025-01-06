import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Housing } from '../interfaces/housing.module';

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

  // HousingEquipment table methods
  async checkHousingEquipment(houseId: string, equipmentId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('housingequipment')
        .select('id')
        .eq('housingid', houseId)
        .eq('equipmentid', equipmentId)
        .eq('deleted', false)
        .single();
  
      if (error && error.code !== 'PGRST116') { 
        throw error;
      }
  
      return !!data; 
    } catch (err) {
      console.error('Error checking housing-equipment association:', err);
      return false;
    }
  }

  async addHousingEquipment(association: { houseId: string; equipmentId: string }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('housingequipment')
        .insert([association]);
  
      if (error) throw error;
    } catch (err) {
      console.error('Error adding housing-equipment association:', err);
    }
  }

  // Houses table methods
  async fetchHouses() {
    try {
      // Fetch housing data with nested relationships
      const { data: houses, error: houseError } = await this.supabase
          .from('housing')
          .select(`
            id,
            name,
            totalpersons,
            totalrooms,
            price,
            typebase: typeid (name),
            address: addressid (street, number, postbox, zipcode, city),
            url
          `)
          .eq('deleted', false) as { data: Housing[] | null, error: any };
  
      if (houseError) {
        console.error('Error fetching houses:', houseError.message, houseError.details, houseError.hint);
        return [];
      }
  
      // Fetch all image files from the storage bucket
      const { data: imageFiles, error: imageError } = await this.supabase
        .storage
        .from(environment.supabaseStorage.bucket)
        .list('');
  
      if (imageError) {
        console.error('Error fetching image files:', imageError.message);
      }
  
      // Fetch all equipment data
      const { data: equipments, error: equipmentError } = await this.supabase
        .from('equipment')
        .select('id, name');
  
      if (equipmentError) {
        console.error('Error fetching equipment:', equipmentError.message);
        return houses.map((house) => ({ ...house, equipmentIcons: [] }));
      }
  
      // Fetch house equipment data
      const { data: houseEquipments, error: houseEquipmentError } = await this.supabase
        .from('housingequipment')
        .select('housingid, equipmentid');
  
      if (houseEquipmentError) {
        console.error('Error fetching house equipments:', houseEquipmentError.message);
        return houses.map((house) => ({ ...house, equipmentIcons: [] }));
      }
  
      // Fetch all icons from the storage bucket
      const { data: iconFiles, error: iconError } = await this.supabase
        .storage
        .from(environment.supabaseStorage.iconBucket)
        .list('');
  
      if (iconError) {
        console.error('Error fetching icons:', iconError.message);
      }
  
      // Helper function: Normalize strings for matching
      const normalizeString = (str: string): string =>
        str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_')
          .toLowerCase();
  
      // Map houses with their corresponding images, address, and equipment
      const defaultImageUrl = this.getDefaultImageUrl();
      return houses.map((house) => {
        // Find matching image for the house
        const normalizedHouseName = normalizeString(house.name);
        const matchingImage = imageFiles?.find((file) =>
          normalizeString(file.name).includes(normalizedHouseName)
        );
  
        // Get all equipment IDs for the current house
        const equipmentIds = houseEquipments
          .filter((equipment) => equipment.housingid === house.id)
          .map((equipment) => equipment.equipmentid);
  
        // Map equipment IDs to names
        const equipmentNames = equipmentIds.map((id) => {
          const equipment = equipments.find((eq) => eq.id === id);
          return equipment ? equipment.name : null;
        });
  
        // Map equipment names to icons
        const equipmentIcons = equipmentNames.map((equipmentName) => {
          const normalizedName = normalizeString(equipmentName || '');
          const matchingIcon = iconFiles?.find((file) =>
            normalizeString(file.name).includes(normalizedName)
          );
  
          return {
            name: equipmentName || '',
            url: matchingIcon
              ? this.getImageUrl(environment.supabaseStorage.iconBucket, matchingIcon.name)
              : null, 
          };
        });
  
        return {
          id: house.id,
          name: house.name,
          totalpersons: house.totalpersons,
          totalrooms: house.totalrooms,
          price: house.price,
          propertyType: house.typebase?.name || '',
          address: `${house.address.street} ${house.address.number}${
            house.address.postbox ? `/${house.address.postbox}, ` : ', '
          }${house.address.zipcode} ${house.address.city}`,
          image: matchingImage
            ? this.getImageUrl(environment.supabaseStorage.bucket, matchingImage.name)
            : defaultImageUrl,
          equipmentIcons: equipmentIcons.sort((a, b) => a.name.localeCompare(b.name)),
        };
      });
    } catch (error) {
      console.error('Unexpected error fetching houses:', error);
      return [];
    }
  } 

  getImageUrl(bucket: string, fileName: string): string {
    const baseUrl = environment.supabaseUrl;
    const encodedFileName = encodeURIComponent(fileName);
    return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedFileName}`;
  }
  
  getDefaultImageUrl(): string {
    const baseUrl = environment.supabaseUrl;
    const bucket = environment.supabaseStorage.bucket;
    return `${baseUrl}/storage/v1/object/public/${bucket}/default.png`;
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
  
      this.houses = houses.map((house) => ({
        ...house,
        address: addresses.find((address) => address.id === house.address_id),
      }));  
      return this.houses.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching houses with addresses:', error);
      return [];
    }
  }

  // Address methods
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

  // Housing table methods
  async addProperty(property: any): Promise<{ id: string }> {
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();
  
    const { data, error } = await this.supabase.from('housing').insert([
      {
        id,
        ...property,
        createdon: timestamp,
        lastupdatedon: timestamp,
      },
    ]).select('id');
  
    if (error) throw error;
  
    if (!data || data.length === 0) {
      throw new Error('Failed to add property. No ID returned.');
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

  async deleteProperty(id: string): Promise<void> {
    const supabase = this.supabase;
  
    try {
      // Fetch the address ID linked to the property
      const { data: property, error: propertyError } = await supabase
        .from('housing')
        .select('addressid')
        .eq('id', id)
        .single();
  
      if (propertyError || !property) {
        throw new Error('Property not found or error fetching the property');
      }
  
      const addressId = property.addressid;
  
      // Soft delete all related housing equipments
      const { error: equipmentError } = await supabase
        .from('housingequipment')
        .update({
          deleted: true,
          lastupdatedon: new Date().toISOString(),
        })
        .eq('housingid', id); // Ensure all entries for this `housingid` are updated
  
      if (equipmentError) {
        throw new Error(`Error soft deleting housing equipment: ${equipmentError.message}`);
      }
  
      // Soft delete the property itself
      const { error: deleteHousingError } = await supabase
        .from('housing')
        .update({
          deleted: true,
          lastupdatedon: new Date().toISOString(),
        })
        .eq('id', id);
  
      if (deleteHousingError) {
        throw new Error(`Error soft deleting the property: ${deleteHousingError.message}`);
      }
  
      // Check if the address is used by any other active (non-deleted) property
      const { data: addressUsages, error: addressError } = await supabase
        .from('housing')
        .select('id')
        .eq('addressid', addressId)
        .eq('deleted', false);
  
      if (addressError) {
        throw new Error(`Error checking address usage: ${addressError.message}`);
      }
  
      // If no other property uses this address, soft delete the address
      if (addressUsages.length === 0) {
        const { error: deleteAddressError } = await supabase
          .from('address')
          .update({
            deleted: true,
            lastupdatedon: new Date().toISOString(),
          })
          .eq('id', addressId);
  
        if (deleteAddressError) {
          throw new Error(`Error soft deleting the address: ${deleteAddressError.message}`);
        }
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }   
}