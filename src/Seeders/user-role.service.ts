// src/Seeders/expense-category-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { user_roles } from '../entities/user-role.entity';
@Injectable()
export class UserRoleSeeder {
  private readonly logger = new Logger(UserRoleSeeder.name);

  constructor(
    @InjectRepository(user_roles)
    private readonly userRoleRepo: Repository<user_roles>,
  ) {}

  async run() {
    const existingRoles = await this.userRoleRepo.find();
    const existingRoleNames = new Set(
      existingRoles.map(role => role.role_name?.trim().toLowerCase())
    );

    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().split(' ')[0];

    const seedData: Partial<user_roles>[] = [
      { role_name: 'Admin' },
      { role_name: 'User' },
    ];

    const rolesToInsert = seedData
      .filter(role => !existingRoleNames.has(role.role_name!.trim().toLowerCase()))
      .map(role => ({
        ...role,
        created_date: formattedDate,
        created_time: currentTime,
      }));

    if (rolesToInsert.length === 0) {
      this.logger.log('Seed skipped: All user roles already exist.');
      return;
    }

    await this.userRoleRepo.save(rolesToInsert);
    this.logger.log(`Seeded ${rolesToInsert.length} new user role(s).`);
  }
}
