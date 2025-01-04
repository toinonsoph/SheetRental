import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../../services/supabase.service';
import { EditMaterialsComponent } from '../edit-materials/edit-materials.component';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-cambre-services',
  templateUrl: './cambre-services.component.html',
  styleUrls: ['./cambre-services.component.css'],
  providers: [SupabaseService],
  imports: [
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    BrowserAnimationsModule, 
  ]
})

export class CambreServicesComponent implements OnInit {
  @Input() selectedTab!: string;

  materials: MatTableDataSource<any> = new MatTableDataSource();
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
      const data = await this.supabase.getMaterials();
      this.materials.data = data; 
    } catch (error) {
      console.error('Error loading materials:', error);
      this.materials.data = [];
    } finally {
      this.isLoading = false;
    }
  }
}