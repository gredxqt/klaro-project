import { TestBed } from '@angular/core/testing';

import { AuthMockService } from './auth-mock.service';

describe('AuthMockService', () => {
  let service: AuthMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
