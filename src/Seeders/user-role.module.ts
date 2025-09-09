import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user_roles } from '../entities/user-role.entity';
import { UserRoleSeeder } from '../Seeders/user-role.service';

@Module({
    imports: [TypeOrmModule.forFeature([user_roles])],
    providers: [UserRoleSeeder],
    exports: [UserRoleSeeder],
})
export class UserRoleSeederModule {}
 