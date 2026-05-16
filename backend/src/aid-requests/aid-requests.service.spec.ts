import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AidRequestsService } from './aid-requests.service';
import { AidRequest, AidCategory, AidStatus } from './entities/aid-request.entity';
import { mockRequest, mockRepo } from './aid-requests.mock';


describe('AidRequestsService', () => {
  let service: AidRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AidRequestsService,
        {
          provide: getRepositoryToken(AidRequest),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<AidRequestsService>(AidRequestsService);
    jest.clearAllMocks();
  });

  it('should create a request with PENDING status', async () => {
    mockRepo.count.mockResolvedValue(0);
    mockRepo.create.mockReturnValue(mockRequest);
    mockRepo.save.mockResolvedValue(mockRequest);

    const result = await service.create({
      beneficiaryId: mockRequest.beneficiaryId,
      category: AidCategory.FOOD,
      amount: 100,
      description: 'Need help with groceries',
    });

    expect(result.status).toBe(AidStatus.PENDING);
    expect(result.id).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw BadRequestException if beneficiary has 2 active requests', async () => {
    mockRepo.count.mockResolvedValue(2);

    await expect(
      service.create({
        beneficiaryId: mockRequest.beneficiaryId,
        category: AidCategory.FOOD,
        amount: 100,
        description: 'Need help with groceries',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should allow valid transition PENDING → UNDER_REVIEW', async () => {
    const updated = { ...mockRequest, status: AidStatus.UNDER_REVIEW };
    mockRepo.findOne.mockResolvedValue({ ...mockRequest, status: AidStatus.PENDING });
    mockRepo.save.mockResolvedValue(updated);

    const result = await service.updateStatus(mockRequest.id, {
      status: AidStatus.UNDER_REVIEW,
    });

    expect(result.status).toBe(AidStatus.UNDER_REVIEW);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw BadRequestException on invalid transition PENDING → APPROVED', async () => {
    mockRepo.findOne.mockResolvedValue({ ...mockRequest, status: AidStatus.PENDING });

    await expect(
      service.updateStatus(mockRequest.id, { status: AidStatus.APPROVED }),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if request does not exist', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(
      service.updateStatus('non-existent-id', { status: AidStatus.UNDER_REVIEW }),
    ).rejects.toThrow(NotFoundException);
  });
});