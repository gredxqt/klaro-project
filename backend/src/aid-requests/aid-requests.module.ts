import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AidRequestsController } from './aid-requests.controller';
import { AidRequestsService } from './aid-requests.service';
import { AidRequest } from './entities/aid-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AidRequest])],
  controllers: [AidRequestsController],
  providers: [AidRequestsService],
})
export class AidRequestsModule {}