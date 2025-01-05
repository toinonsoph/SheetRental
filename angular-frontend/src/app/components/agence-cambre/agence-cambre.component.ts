import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-agence-cambre',
  templateUrl: './agence-cambre.component.html',
  styleUrls: ['./agence-cambre.component.css'],
  standalone: true
})
export class AgenceCambreComponent implements OnInit { 
  ngOnInit() {
    console.log('Agence Cambre Component Initialized');
  }
}