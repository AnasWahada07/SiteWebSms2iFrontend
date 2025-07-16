import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDemandeFormation } from './view-demande-formation';

describe('ViewDemandeFormation', () => {
  let component: ViewDemandeFormation;
  let fixture: ComponentFixture<ViewDemandeFormation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDemandeFormation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDemandeFormation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
