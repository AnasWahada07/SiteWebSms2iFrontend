import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGalerie } from './view-galerie';

describe('ViewGalerie', () => {
  let component: ViewGalerie;
  let fixture: ComponentFixture<ViewGalerie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGalerie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewGalerie);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
