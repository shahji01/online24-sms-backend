import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/school.dto';
import { School } from './entity/school.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SchoolService {
 constructor(
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
  ) {}

    async create(dto: CreateSchoolDto): Promise<School> {
        const school = this.schoolRepo.create(dto);
        return await this.schoolRepo.save(school);
    }

    async findAll(body:any): Promise<School[]> {
        return await this.schoolRepo.find({where:{status:body.status}});
    }

    async findOne(body:any) {
        
        const result =  await this.schoolRepo.findOne({ where: {id : body.id } });
        console.log(body, result)
        return result
    }

    async update(id: number, dto: CreateSchoolDto) {
        console.log(id)
        await this.schoolRepo.update(id, dto);
    }
    async softDelete(body:any){
         return await this.schoolRepo.update({ id: body.id }, { status: body.status });
    }
}
