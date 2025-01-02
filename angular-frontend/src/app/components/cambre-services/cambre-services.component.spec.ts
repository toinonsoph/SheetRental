import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambreServicesComponent } from './cambre-services.component';

describe('CambreServicesComponent', () => {
  let component: CambreServicesComponent;
  let fixture: ComponentFixture<CambreServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambreServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambreServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
