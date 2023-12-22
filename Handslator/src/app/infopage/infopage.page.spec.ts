import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfopagePage } from './infopage.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { InfopagePage } from './infopage.page';
import {Tab2Page} from "../tab2/tab2.page";
import {IonicModule} from "@ionic/angular";
import {InfopagePageModule} from "./infopage.module";


describe('InfopagePage', () => {
  let component: InfopagePage;
  let fixture: ComponentFixture<InfopagePage>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfopagePage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InfopagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
