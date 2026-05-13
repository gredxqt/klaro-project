import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthMockService {
  // Simulates Firebase Auth currentUser
  readonly currentUserId = '00000000-0000-0000-0000-000000000001';
  readonly currentRole: 'beneficiary' | 'manager' = 'beneficiary';
}