import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerhuurComponent } from './verhuur.component';

describe('VerhuurComponent', () => {
  let component: VerhuurComponent;
  let fixture: ComponentFixture<VerhuurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerhuurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerhuurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
