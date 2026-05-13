export enum AidCategory {
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  ENERGY = 'ENERGY',
  OTHER = 'OTHER',
}

export enum AidStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface AidRequest {
  id: string;
  beneficiaryId: string;
  category: AidCategory;
  amount: number;
  description: string;
  status: AidStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  data: AidRequest[];
  total: number;
  page: number;
  limit: number;
}