import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInscritFormation } from './view-inscrit-formation';

describe('ViewInscritFormation', () => {
  let component: ViewInscritFormation;
  let fixture: ComponentFixture<ViewInscritFormation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewInscritFormation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewInscritFormation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
