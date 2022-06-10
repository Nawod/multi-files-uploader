import { TestBed } from '@angular/core/testing';

import { NgxMultiFileUploaderService } from './ngx-multi-file-uploader.service';

describe('NgxMultiFileUploaderService', () => {
  let service: NgxMultiFileUploaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMultiFileUploaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
