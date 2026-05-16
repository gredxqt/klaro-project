import { AidRequest, AidCategory, AidStatus } from './entities/aid-request.entity';

export const mockRequest: AidRequest = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  beneficiaryId: '00000000-0000-0000-0000-000000000001',
  category: AidCategory.FOOD,
  amount: 100,
  description: 'Need help with groceries',
  status: AidStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockRepo = {
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
};