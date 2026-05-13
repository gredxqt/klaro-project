import {
  Column, CreateDateColumn, Entity,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

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

@Entity('aid_requests')
export class AidRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  beneficiaryId: string;

  @Column({ type: 'enum', enum: AidCategory })
  category: AidCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: AidStatus, default: AidStatus.PENDING })
  status: AidStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}