import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenceCambreComponent } from './agence-cambre.component';

describe('AgenceCambreComponent', () => {
  let component: AgenceCambreComponent;
  let fixture: ComponentFixture<AgenceCambreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgenceCambreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenceCambreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
