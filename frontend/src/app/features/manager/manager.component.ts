import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AidRequestsService } from '../../core/services/aid-requests.service';
import { AidRequest, AidStatus } from '../../core/models/aid-request.model';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss'],
})
export class ManagerComponent implements OnInit, OnDestroy {
  requests: AidRequest[] = [];
  displayedColumns = ['beneficiaryId', 'category', 'amount', 'description', 'status', 'actions'];
  readonly AidStatus = AidStatus;

  private destroy$ = new Subject<void>();

  constructor(private aidService: AidRequestsService) {}

  ngOnInit(): void {
    this.aidService.allRequests$
      .pipe(takeUntil(this.destroy$))
      .subscribe((requests) => (this.requests = requests));

    this.aidService.loadAllRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  getAllowedTransitions(status: AidStatus): AidStatus[] {
    const transitions: Record<AidStatus, AidStatus[]> = {
      [AidStatus.PENDING]: [AidStatus.UNDER_REVIEW, AidStatus.REJECTED],
      [AidStatus.UNDER_REVIEW]: [AidStatus.APPROVED, AidStatus.REJECTED],
      [AidStatus.APPROVED]: [],
      [AidStatus.REJECTED]: [],
    };
    return transitions[status];
  }

  changeStatus(id: string, status: AidStatus): void {
    this.aidService.updateStatus(id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}