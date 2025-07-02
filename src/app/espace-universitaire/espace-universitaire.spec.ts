import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceUniversitaire } from './espace-universitaire';

describe('EspaceUniversitaire', () => {
  let component: EspaceUniversitaire;
  let fixture: ComponentFixture<EspaceUniversitaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceUniversitaire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspaceUniversitaire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
