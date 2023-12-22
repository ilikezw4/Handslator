import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CamerapagePage } from './camerapage.page';

describe('CamerapagePage', () => {
  let component: CamerapagePage;
  let fixture: ComponentFixture<CamerapagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CamerapagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
