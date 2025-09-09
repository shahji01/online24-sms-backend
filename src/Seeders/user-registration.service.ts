// src/Seeders/expense-category-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UserRegistration {
  private readonly logger = new Logger(UserRegistration.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async run() {
    const existingUsers = await this.userRepo.find();
    const existingEmails = new Set(
      existingUsers.map(user => user.email?.trim().toLowerCase())
    );

    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().split(' ')[0];
    const hashedPassword = await bcrypt.hash('123456789', 10);

    const seedData: Partial<User>[] = [
      {
        name: 'John',
        email: 'admin@gmail.com',
        phone: '1234567890',
        address: 'NZ',
      },
      {
        name: 'Cynthia',
        email: 'cynthia@gmail.com',
        phone: '09123456766',
        address: 'NZ',
      },
    ];

    const usersToInsert = seedData
      .filter(user => !existingEmails.has(user.email!.trim().toLowerCase()))
      .map(user => ({
        ...user,
        password: hashedPassword,
        created_date: formattedDate,
        created_time: currentTime,
      }));

    if (usersToInsert.length === 0) {
      this.logger.log('Seed skipped: All users already exist.');
      return;
    }

    await this.userRepo.save(usersToInsert);
    this.logger.log(`Seeded ${usersToInsert.length} new user(s).`);
  }
}
