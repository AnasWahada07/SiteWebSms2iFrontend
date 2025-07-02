import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInscription } from './view-inscription';

describe('ViewInscription', () => {
  let component: ViewInscription;
  let fixture: ComponentFixture<ViewInscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewInscription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewInscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
