import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextpagePage } from './textpage.page';

describe('TextpagePage', () => {
  let component: TextpagePage;
  let fixture: ComponentFixture<TextpagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TextpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
