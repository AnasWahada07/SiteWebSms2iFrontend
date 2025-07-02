import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFormation } from './view-formation';

describe('ViewFormation', () => {
  let component: ViewFormation;
  let fixture: ComponentFixture<ViewFormation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFormation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewFormation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
