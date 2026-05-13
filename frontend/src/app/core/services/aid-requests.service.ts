import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AidRequest, AidStatus, PaginatedResponse } from '../models/aid-request.model';

export interface CreateAidRequestPayload {
  beneficiaryId: string;
  category: string;
  amount: number;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class AidRequestsService {
  private readonly apiUrl = 'http://localhost:3000/aid-requests';

  private myRequestsSubject = new BehaviorSubject<AidRequest[]>([]);
  myRequests$ = this.myRequestsSubject.asObservable();

  private allRequestsSubject = new BehaviorSubject<AidRequest[]>([]);
  allRequests$ = this.allRequestsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadMyRequests(beneficiaryId: string): Observable<PaginatedResponse> {
    const params = new HttpParams().set('beneficiaryId', beneficiaryId);
    return this.http.get<PaginatedResponse>(this.apiUrl, { params }).pipe(
      tap((res) => this.myRequestsSubject.next(res.data)),
    );
  }

  loadAllRequests(): Observable<PaginatedResponse> {
    return this.http.get<PaginatedResponse>(this.apiUrl).pipe(
      tap((res) => this.allRequestsSubject.next(res.data)),
    );
  }

  createRequest(payload: any): Observable<AidRequest> {
    
    return this.http.post<AidRequest>(this.apiUrl, payload).pipe(
      
      tap((newRequest) => {
        this.myRequestsSubject.next([
          newRequest,
          ...this.myRequestsSubject.getValue(),
        ]);
      }),
    );
  }

  updateStatus(id: string, status: AidStatus): Observable<AidRequest> {
    return this.http.patch<AidRequest>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap((updated) => {
        const updateList = (list: AidRequest[]) =>
          list.map((r) => (r.id === updated.id ? updated : r));
        this.allRequestsSubject.next(updateList(this.allRequestsSubject.getValue()));
        this.myRequestsSubject.next(updateList(this.myRequestsSubject.getValue()));
      }),
    );
  }
}