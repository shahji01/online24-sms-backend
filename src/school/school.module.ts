import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entity/school.entity';
import { User } from 'src/entities/user.entity';

@Module({
  controllers: [SchoolController],
  providers: [SchoolService],
  imports : [TypeOrmModule.forFeature([School, User])]
})
export class SchoolModule {}
