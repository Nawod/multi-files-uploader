import { TestBed } from '@angular/core/testing';

import { UploadrService } from './uploadr.service';

describe('UploadrService', () => {
  let service: UploadrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
