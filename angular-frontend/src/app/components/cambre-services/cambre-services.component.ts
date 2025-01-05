import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../../services/supabase.service';
import { EditMaterialsComponent } from '../edit-materials/edit-materials.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
      const materials = await this.supabase.getMaterials();
      this.materials = new MatTableDataSource(materials || []);
      this.materials.paginator = this.paginator; // Assign paginator
      this.materials.sort = this.sort; // Assign sorting
    } catch (error) {
      console.error('Failed to load materials:', error.message);
      this.materials = new MatTableDataSource([]);
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
      if (result) {
        await this.loadMaterials();
      }
    });
  }
  
  async deleteMaterial(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
    });
  
    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.supabase.deleteMaterial(id);
          await this.loadMaterials();
        } catch (error) {
          console.error('Error deleting material:', error);
        }
      }
    });
  }
}