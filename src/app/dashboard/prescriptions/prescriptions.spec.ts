import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionsComponent } from './prescriptions';

describe('PrescriptionsComponent', () => {
  let component: PrescriptionsComponent;
  let fixture: ComponentFixture<PrescriptionsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
