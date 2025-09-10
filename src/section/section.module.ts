import { Module } from '@nestjs/common';
import { SectionController } from './section.controller';
import { SectionService } from './section.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entity/section.entity';

@Module({
  controllers: [SectionController],
  providers: [SectionService],
  imports: [TypeOrmModule.forFeature([Section])],
})
export class SectionModule {}
