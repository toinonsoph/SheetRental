import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEquipmentsComponent } from './edit-equipments.component';

describe('EditEquipmentsComponent', () => {
  let component: EditEquipmentsComponent;
  let fixture: ComponentFixture<EditEquipmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEquipmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEquipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
