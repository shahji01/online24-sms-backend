import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from 'src/entities/Permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Permission])],
  providers: [PermissionsService],
  controllers: [PermissionsController]
})
export class PermissionsModule {}
