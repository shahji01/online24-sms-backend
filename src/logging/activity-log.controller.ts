// src/logging/activity-log.controller.ts
import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly logRepo: Repository<ActivityLog>,
  ) {}

  @Get()
  async getLogs(
    @Query('entity') entity?: number,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    const query = this.logRepo
      .createQueryBuilder('al')
      .innerJoin('user', 'u', 'u.id = al.userId');

    if (entity) {
      query.andWhere('al.entity = :entity', { entity });
    }

    if (action) {
      query.andWhere('al.action = :action', { action });
    }

    if (userId) {
      query.andWhere('al.userId = :userId', { userId });
    }

    if (startDate && endDate) {
      query.andWhere('al.timestamp BETWEEN :start AND :end', {
        start: `${startDate} 00:00:00`,
        end: `${endDate} 23:59:59`,
      });
    }

    query
      .select([
        'al.id',
        'al.action',
        'al.entity',
        'al.entityId',
        'al.oldValue',
        'al.newValue',
        'al.timestamp',
        'al.lang_code',
        'al.userId',
        'u.name as user_name',
      ])
      .orderBy('al.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rawData, total] = await Promise.all([
      query.getRawMany(), // <-- ab raw results milenge jisme user_name hoga
      query.getCount(),
    ]);

    return {
      data: rawData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
