import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Viewcompetence } from './viewcompetence';

describe('Viewcompetence', () => {
  let component: Viewcompetence;
  let fixture: ComponentFixture<Viewcompetence>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viewcompetence]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Viewcompetence);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
