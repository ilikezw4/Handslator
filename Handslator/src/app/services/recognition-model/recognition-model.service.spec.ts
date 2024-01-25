import { TestBed } from '@angular/core/testing';

import { RecognitionModelService } from './recognition-model.service';

describe('RecognitionModelService', () => {
  let service: RecognitionModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecognitionModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
