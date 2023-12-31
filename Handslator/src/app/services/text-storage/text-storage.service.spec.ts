import { TestBed } from '@angular/core/testing';

import { TextStorageService } from './text-storage.service';

describe('TextStorageService', () => {
  let service: TextStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
