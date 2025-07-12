import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Maquette } from './maquette';

describe('Maquette', () => {
  let component: Maquette;
  let fixture: ComponentFixture<Maquette>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Maquette]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Maquette);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
