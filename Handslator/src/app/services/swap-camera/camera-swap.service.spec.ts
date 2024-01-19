import { TestBed } from '@angular/core/testing';

import { CameraSwapService } from './camera-swap.service';

describe('CameraSwapService', () => {
  let service: CameraSwapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CameraSwapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
