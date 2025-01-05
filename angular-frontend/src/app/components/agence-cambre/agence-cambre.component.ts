import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SupabaseService } from '../../services/supabase.service';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-agence-cambre',
  templateUrl:'./agence-cambre.component.html',
  styleUrls: ['./agence-cambre.component.css'],
  imports: 
  [
      MatTabsModule,
      MatTableModule 
  ],
  standalone: true
})
export class AgenceCambreComponent { 
}
