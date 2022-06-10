import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMultiFileUploaderComponent } from './ngx-multi-file-uploader.component';

describe('NgxMultiFileUploaderComponent', () => {
  let component: NgxMultiFileUploaderComponent;
  let fixture: ComponentFixture<NgxMultiFileUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxMultiFileUploaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMultiFileUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
