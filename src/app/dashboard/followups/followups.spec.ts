import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupsComponent } from './followups';

describe('FollowupsComponent', () => {
  let component: FollowupsComponent;
  let fixture: ComponentFixture<FollowupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowupsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
