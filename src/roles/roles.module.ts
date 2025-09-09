import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from 'src/entities/role.entity';
import { Permission } from 'src/entities/Permission.entity';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Role,Permission]),PermissionsModule],
  providers: [RolesService],
  controllers: [RolesController]
})
export class RolesModule {}
