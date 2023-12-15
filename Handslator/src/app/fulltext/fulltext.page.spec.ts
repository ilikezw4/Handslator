import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FulltextPage } from './fulltext.page';

describe('FulltextPage', () => {
  let component: FulltextPage;
  let fixture: ComponentFixture<FulltextPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FulltextPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
