import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { Language } from './Language.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Language])],
  providers: [LanguagesService],
  controllers: [LanguagesController]
})
export class LanguagesModule {}
