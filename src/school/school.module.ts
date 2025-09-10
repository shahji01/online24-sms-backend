import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entity/school.entity';

@Module({
  controllers: [SchoolController],
  providers: [SchoolService],
  imports : [TypeOrmModule.forFeature([School])]
})
export class SchoolModule {}
