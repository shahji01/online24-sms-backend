import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../section/entity/section.entity';
import { CreateSectionDto } from '../section/dto/section.dto';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,
  ) {}

  async create(dto: CreateSectionDto): Promise<Section> {
    const section = this.sectionRepo.create(dto);
    return await this.sectionRepo.save(section);
  }

  async findAll(body: any): Promise<Section[]> {
    return await this.sectionRepo.find({ where: { status: body.status } });
  }

  async findOne(body: any) {
    return await this.sectionRepo.findOne({ where: { id: body.id } });
  }

  async update(id: number, dto: CreateSectionDto) {
    await this.sectionRepo.update(id, dto);
    return await this.findOne({ id });
  }

  async softDelete(body: any) {
    await this.sectionRepo.update(body.id, { status: body.status });
  }
}
