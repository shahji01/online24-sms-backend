import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campus } from '../campus/entity/campus.entity';
import { CreateCampusDto } from '../campus/dto/campus.dto';

@Injectable()
export class CampusService {
  constructor(
    @InjectRepository(Campus)
    private readonly campusRepo: Repository<Campus>,
  ) {}

  async create(dto: CreateCampusDto){
    const campus = this.campusRepo.create(dto);
    return await this.campusRepo.save(campus);
  }

  async findAll(body: any): Promise<Campus[]> {
    return await this.campusRepo.find({
      where: { status: body.status },
      relations: ['school'],
    });
  }

  async findOne(body: any){
    return await this.campusRepo.findOne({
      where: { id: body.id },
      relations: ['school'],
    });
  }

  async update(id: number, dto: CreateCampusDto) {
    await this.campusRepo.update(id, dto);
    return this.findOne({ id });
  }

  async softDelete(body: any) {
    return await this.campusRepo.update(
      { id: body.id },
      { status: body.status },
    );
  }
}
