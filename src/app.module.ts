import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UserRegistration } from './Seeders/user-registration.service';
import { UserRegistrationSeederModule } from './Seeders/user-register.module';
import { UserRoleSeederModule } from './Seeders/user-role.module';
import { UserRoleSeeder } from './Seeders/user-role.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ChatModule } from './chat/chat.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { DatabaseModule } from './Database/database.module';
import { LanguagesModule } from './languages/languages.module';
import { LoggingModule } from './logging/logging.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true, // makes it available globally
    }),
    //Local
      TypeOrmModule.forRoot({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'online24-sms',
        autoLoadEntities: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    UsersModule,
    AuthModule,
    UserRegistrationSeederModule,
    UserRoleSeederModule,
    ChatModule,
    RolesModule,
    PermissionsModule,
    DatabaseModule,
    LanguagesModule,
    LoggingModule
  ],

})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly userRegistration: UserRegistration,
    private readonly userRole: UserRoleSeeder,

  ) { }

  async onModuleInit() {
    await this.userRegistration.run();
    await this.userRole.run();
    //await this.ravisOldSeeder.run();
  }
}
