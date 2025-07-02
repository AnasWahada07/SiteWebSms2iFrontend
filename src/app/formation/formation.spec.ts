import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Formation } from './formation';

describe('Formation', () => {
  let component: Formation;
  let fixture: ComponentFixture<Formation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Formation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
