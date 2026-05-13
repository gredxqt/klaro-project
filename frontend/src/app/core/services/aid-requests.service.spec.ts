import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AidRequestsService } from './aid-requests.service';
import { AidCategory, AidRequest, AidStatus } from '../models/aid-request.model';

const mockRequest: AidRequest = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  beneficiaryId: '00000000-0000-0000-0000-000000000001',
  category: AidCategory.FOOD,
  amount: 150,
  description: 'Need help with groceries',
  status: AidStatus.PENDING,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('AidRequestsService', () => {
  let service: AidRequestsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AidRequestsService],
    });

    service = TestBed.inject(AidRequestsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no unexpected requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load my requests and update myRequests$', () => {
    const beneficiaryId = '00000000-0000-0000-0000-000000000001';

    service.loadMyRequests(beneficiaryId).subscribe();

    const req = httpMock.expectOne(
      `http://localhost:3000/aid-requests?beneficiaryId=${beneficiaryId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: [mockRequest], total: 1, page: 1, limit: 10 });

    service.myRequests$.subscribe((requests) => {
      expect(requests.length).toBe(1);
      expect(requests[0].status).toBe(AidStatus.PENDING);
    });
  });

  it('should create a request and prepend it to myRequests$', () => {
    const payload = {
      beneficiaryId: '00000000-0000-0000-0000-000000000001',
      category: AidCategory.FOOD,
      amount: 150,
      description: 'Need help with groceries',
    };

    service.createRequest(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/aid-requests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockRequest);

    service.myRequests$.subscribe((requests) => {
      expect(requests[0].id).toBe(mockRequest.id);
    });
  });

  it('should update status and reflect change in allRequests$', () => {
    // First seed allRequests$ with a mock request
    service['allRequestsSubject'].next([mockRequest]);

    const updatedRequest = { ...mockRequest, status: AidStatus.UNDER_REVIEW };

    service.updateStatus(mockRequest.id, AidStatus.UNDER_REVIEW).subscribe();

    const req = httpMock.expectOne(
      `http://localhost:3000/aid-requests/${mockRequest.id}/status`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: AidStatus.UNDER_REVIEW });
    req.flush(updatedRequest);

    service.allRequests$.subscribe((requests) => {
      const found = requests.find((r) => r.id === mockRequest.id);
      expect(found?.status).toBe(AidStatus.UNDER_REVIEW);
    });
  });
});