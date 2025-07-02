import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeFormation } from './demande-formation';

describe('DemandeFormation', () => {
  let component: DemandeFormation;
  let fixture: ComponentFixture<DemandeFormation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeFormation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeFormation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
