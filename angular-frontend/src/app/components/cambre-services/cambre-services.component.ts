import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../../services/supabase.service';
import { EditMaterialsComponent } from '../edit-materials/edit-materials.component';

@Component({
  selector: 'app-cambre-services',
  templateUrl: './cambre-services.component.html',
  styleUrls: ['./cambre-services.component.css'],
  providers: [SupabaseService],
})
export class CambreServicesComponent implements OnInit {
  @Input() selectedTab!: string;

  materials: any[] = [];
  isLoading = false;

  displayedColumns: string[] = [
    'nameDutch',
    'nameFrench',
    'nameGerman',
    'infoDutch',
    'infoFrench',
    'infoGerman',
    'price',
    'actions',
  ];

  constructor(
    private supabase: SupabaseService,
    private dialog: MatDialog
  ) {}

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
    const dialogRef = this.dialog.open(EditMaterialsComponent, {
      width: '600px',
      data: { material: null },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) await this.loadMaterials();
    });
  }

  openEditDialog(material: any) {
    const dialogRef = this.dialog.open(EditMaterialsComponent, {
      width: '600px',
      data: { material },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) await this.loadMaterials();
    });
  }

  async deleteMaterial(id: string) {
    try {
      await this.supabase.deleteMaterial(id);
      await this.loadMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  }
}