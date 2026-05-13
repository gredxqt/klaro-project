import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { UpdateAidRequestStatusDto } from './dto/update-aid-request-status.dto';
import { AidRequest, AidStatus } from './entities/aid-request.entity';

const VALID_TRANSITIONS: Record<AidStatus, AidStatus[]> = {
  [AidStatus.PENDING]: [AidStatus.UNDER_REVIEW, AidStatus.REJECTED],
  [AidStatus.UNDER_REVIEW]: [AidStatus.APPROVED, AidStatus.REJECTED],
  [AidStatus.APPROVED]: [],
  [AidStatus.REJECTED]: [],
};

@Injectable()
export class AidRequestsService {
  constructor(
    @InjectRepository(AidRequest)
    private readonly repo: Repository<AidRequest>,
  ) {}

  async create(dto: CreateAidRequestDto): Promise<AidRequest> {
    const activeCount = await this.repo.count({
      where: [
        { beneficiaryId: dto.beneficiaryId, status: AidStatus.PENDING },
        { beneficiaryId: dto.beneficiaryId, status: AidStatus.UNDER_REVIEW },
      ],
    });

    if (activeCount >= 2) {
      throw new BadRequestException(
        'Beneficiary already has 2 active requests (PENDING or UNDER_REVIEW)',
      );
    }

    const request = this.repo.create({ ...dto, status: AidStatus.PENDING });
    return this.repo.save(request);
  }

  async findAll(
    beneficiaryId?: string,
    status?: AidStatus,
    page = 1,
    limit = 10,
  ) {
    const where: any = {};
    if (beneficiaryId) where.beneficiaryId = beneficiaryId;
    if (status) where.status = status;

    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async updateStatus(id: string, dto: UpdateAidRequestStatusDto): Promise<AidRequest> {
    const request = await this.repo.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`AidRequest ${id} not found`);
    }

    const allowed = VALID_TRANSITIONS[request.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Transition from ${request.status} to ${dto.status} is not allowed. ` +
        `Allowed: ${allowed.length ? allowed.join(', ') : 'none'}`,
      );
    }

    request.status = dto.status;
    return this.repo.save(request);
  }
}