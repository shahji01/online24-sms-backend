import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../class/entity/class.entity';
import { CreateClassDto } from './dto/class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
  ) {}

  async create(dto: CreateClassDto): Promise<Class> {
    const newClass = this.classRepo.create(dto);
    return await this.classRepo.save(newClass);
  }

  async findAll(body: any): Promise<Class[]> {
    return await this.classRepo.find({ where: { status: body.status } });
  }

  async findOne(body: any) {
    return await this.classRepo.findOne({ where: { id: body.id } });
  }

  async update(id: number, dto: CreateClassDto){
    await this.classRepo.update(id, dto);
    return await this.findOne({ id });
  }

  async softDelete(body: any) {
    await this.classRepo.update(body.id, { status: body.status });
  }
}
