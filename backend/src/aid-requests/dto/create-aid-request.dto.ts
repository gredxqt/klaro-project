import {
  IsEnum, IsNumber, IsString, IsUUID,
  Max, Min, MinLength,
} from 'class-validator';
import { AidCategory } from '../entities/aid-request.entity';

export class CreateAidRequestDto {
  @IsUUID()
  beneficiaryId: string;

  @IsEnum(AidCategory)
  category: AidCategory;

  @IsNumber()
  @Min(0.01)
  @Max(5000)
  amount: number;

  @IsString()
  @MinLength(10)
  description: string;
}