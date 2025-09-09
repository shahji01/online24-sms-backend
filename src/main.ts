import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PermissionSeeder } from './permissions/seeder/permission.seeder';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚨 WARNING: This allows all origins (not recommended in production)
  app.enableCors({
    origin: '*',
  });

  const dataSource: DataSource = app.get(DataSource);

  app.useGlobalPipes(new ValidationPipe());
  await PermissionSeeder(dataSource);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
