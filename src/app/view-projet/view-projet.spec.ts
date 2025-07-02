import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProjet } from './view-projet';

describe('ViewProjet', () => {
  let component: ViewProjet;
  let fixture: ComponentFixture<ViewProjet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProjet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewProjet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
