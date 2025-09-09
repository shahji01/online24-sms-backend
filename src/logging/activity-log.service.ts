// src/logging/activity-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
  ) {}

  async log({
    action,
    entity,
    entityId,
    oldValue,
    newValue,
    userId,
    lang_code,
  }: {
    action: string;
    entity: number;
    entityId?: number;
    oldValue?: any;
    newValue?: any;
    userId?: string;
    lang_code?: string;
  }) {
    const log = this.activityRepo.create({
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      userId,
      lang_code,
    });

    await this.activityRepo.save(log);
  }
}
