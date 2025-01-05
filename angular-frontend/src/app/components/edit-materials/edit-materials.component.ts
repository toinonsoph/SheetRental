import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-materials',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './edit-materials.component.html',
  styleUrls: ['./edit-materials.component.css']
})
export class EditMaterialsComponent {
  materialForm: FormGroup;
  isEditing: boolean;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private dialogRef: MatDialogRef<EditMaterialsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { material: any }
  ) {
    this.isEditing = !!data.material;
    console.log(this.isEditing);
  
    this.materialForm = this.fb.group({
      name_dutch: [data.material?.name_dutch || '', [Validators.required, Validators.maxLength(500)]],
      name_french: [data.material?.name_french || '', [Validators.required, Validators.maxLength(500)]],
      name_german: [data.material?.name_german || '', [Validators.required, Validators.maxLength(500)]],
      information_dutch: [data.material?.information_dutch || '', [Validators.maxLength(500)]],
      information_french: [data.material?.information_french || '', [Validators.maxLength(500)]],
      information_german: [data.material?.information_german || '', [Validators.maxLength(500)]],
      price: [data.material?.price || null, Validators.min(0)],
    });
  }

  async submitForm() {
    if (this.materialForm.invalid) return;

    const material = this.materialForm.value;
    try {
      if (this.isEditing) {
        await this.supabase.updateMaterial(this.data.material.id, material);
      } else {
        await this.supabase.addMaterial(material);
      }
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error saving material:', error);
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
