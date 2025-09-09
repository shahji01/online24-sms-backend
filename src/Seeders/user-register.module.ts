import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserRegistration } from '../Seeders/user-registration.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserRegistration],
    exports: [UserRegistration],
})
export class UserRegistrationSeederModule {}
 