import { Module } from '@nestjs/common';
import { CampusController } from './campus.controller';
import { CampusService } from './campus.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campus } from './entity/campus.entity';

@Module({
  controllers: [CampusController],
  providers: [CampusService],
  imports: [TypeOrmModule.forFeature([Campus])],
})
export class CampusModule {}
