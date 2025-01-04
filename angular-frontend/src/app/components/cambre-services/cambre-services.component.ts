import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-cambre-services',
  templateUrl: './cambre-services.component.html',
  styleUrls: ['./cambre-services.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], 
  providers: [SupabaseService], 
})

export class CambreServicesComponent implements OnInit {
  @Input() selectedTab!: string;

  materials: any[] = [];
  materialForm: FormGroup;
  isFormVisible = false;
  isEditing = false;
  editingMaterialId: string | null = null;
  isLoading = false;

  constructor(private supabase: SupabaseService, private fb: FormBuilder) {
    this.materialForm = this.fb.group({
      name_dutch: ['', [Validators.required, Validators.maxLength(500)]],
      name_french: ['', [Validators.required, Validators.maxLength(500)]],
      name_german: ['', [Validators.required, Validators.maxLength(500)]],
      information_dutch: ['', [Validators.maxLength(500)]],
      information_french: ['', [Validators.maxLength(500)]],
      information_german: ['', [Validators.maxLength(500)]],
      price: [null, [Validators.required, Validators.min(0)]],
    });
  }

  async ngOnInit() {
    await this.loadMaterials();
  }  

  async loadMaterials() {
    this.isLoading = true;
    try {
      this.materials = await this.supabase.getMaterials();
    } catch (error) {
      console.error('Error loading materials:', error);
      this.materials = [];
    } finally {
      this.isLoading = false;
    }
  }

  openAddDialog() {
    this.isFormVisible = true;
    this.isEditing = false;
    this.materialForm.reset();
  }

  openEditDialog(material: any) {
    this.isFormVisible = true;
    this.isEditing = true;
    this.editingMaterialId = material.id.toString(); 
    this.materialForm.patchValue(material);
  }
  
  async submitForm() {
    if (this.materialForm.invalid) {
      console.error('Form is invalid');
      return;
    }
  
    const material = this.materialForm.value;
  
    try {
      if (this.isEditing && this.editingMaterialId) {
        await this.supabase.updateMaterial(this.editingMaterialId, material);
      } else {
        await this.supabase.addMaterial(material);
      }
      this.isFormVisible = false;
      await this.loadMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
    }
  }
  
  async deleteMaterial(id: string) {
    try {
      await this.supabase.deleteMaterial(id);
      await this.loadMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  }

  cancelForm() {
    this.isFormVisible = false;
    this.materialForm.reset();
  }  
}