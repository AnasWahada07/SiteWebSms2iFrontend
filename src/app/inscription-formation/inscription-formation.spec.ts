import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionFormation } from './inscription-formation';

describe('InscriptionFormation', () => {
  let component: InscriptionFormation;
  let fixture: ComponentFixture<InscriptionFormation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionFormation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionFormation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
