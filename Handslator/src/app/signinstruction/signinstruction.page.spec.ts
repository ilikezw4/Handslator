import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SigninstructionPage } from './signinstruction.page';

describe('SigninstructionPage', () => {
  let component: SigninstructionPage;
  let fixture: ComponentFixture<SigninstructionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SigninstructionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
