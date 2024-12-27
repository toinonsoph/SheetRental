import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LakensComponent } from './lakens.component';

describe('LakensComponent', () => {
  let component: LakensComponent;
  let fixture: ComponentFixture<LakensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LakensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LakensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
