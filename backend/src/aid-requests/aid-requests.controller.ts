import {
  Body, Controller, Get, Param, Patch,
  Post, Query, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { AidRequestsService } from './aid-requests.service';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { UpdateAidRequestStatusDto } from './dto/update-aid-request-status.dto';
import { AidStatus } from './entities/aid-request.entity';

@Controller('aid-requests')
export class AidRequestsController {
  constructor(private readonly service: AidRequestsService) {}

  @Post()
  create(@Body() dto: CreateAidRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('beneficiaryId') beneficiaryId?: string,
    @Query('status') status?: AidStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.service.findAll(beneficiaryId, status, page, limit);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAidRequestStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }
}