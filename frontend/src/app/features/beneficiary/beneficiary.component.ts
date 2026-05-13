import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AidRequestsService } from '../../core/services/aid-requests.service';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { AidCategory, AidRequest, AidStatus } from '../../core/models/aid-request.model';

@Component({
  selector: 'app-beneficiary',
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.scss'],
})
export class BeneficiaryComponent implements OnInit, OnDestroy {
  form: FormGroup;
  requests: AidRequest[] = [];
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  categories = Object.values(AidCategory);
  readonly AidStatus = AidStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private aidService: AidRequestsService,
    private auth: AuthMockService,
  ) {
    this.form = this.fb.group({
      category: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01), Validators.max(5000)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.aidService.myRequests$
      .pipe(takeUntil(this.destroy$))
      .subscribe((requests) => (this.requests = requests));

    this.aidService.loadMyRequests(this.auth.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.aidService.createRequest({
      beneficiaryId: this.auth.currentUserId,
      ...this.form.value,
    
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.successMessage = 'Request submitted successfully!';
        this.form.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        
        this.errorMessage = err.error?.message ?? 'Something went wrong';
        this.isSubmitting = false;
      },
    });
  }

  getStatusColor(status: AidStatus): string {
    const map: Record<AidStatus, string> = {
      [AidStatus.PENDING]: 'accent',
      [AidStatus.UNDER_REVIEW]: 'primary',
      [AidStatus.APPROVED]: '',
      [AidStatus.REJECTED]: 'warn',
    };
    return map[status];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}