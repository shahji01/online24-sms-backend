import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSchoolDto } from './dto/school.dto';
import { School } from './entity/school.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class SchoolService {
 constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,

  ) {}

    async create(dto: CreateSchoolDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // 1) create school
            const school = this.schoolRepo.create({
                name: dto.name,
                address: dto.address,
                contact_no: dto.contact_no,
            });
            const savedSchool = await queryRunner.manager.save(school);

            // 2) generate a secure random password
            const plainPassword = '123456789' // return string
            const hashed = await bcrypt.hash(plainPassword, 10);

            // 3) create user (school admin)
            const user = this.userRepo.create({
                name: dto.name,
                email: dto.admin_email,
                password: hashed,
                school: savedSchool,
                type: 2
            });

            await queryRunner.manager.save(user);

            // commit
            await queryRunner.commitTransaction();

            // return created school + the plain password so frontend can show it
            // NOTE: in production send an email and do not return plain password
            return {
                status: true,
                message: 'School Added Successfully',
                data: {
                school: savedSchool,
                credentials: { email: dto.admin_email, password: plainPassword },
                },
            };
        } catch (e) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(e.message || 'Failed to create school');
        } finally {
            await queryRunner.release();
        }
    }

    private generatePassword(len = 12) {
        // Secure random alphanumeric with symbols optionally
        return randomBytes(Math.ceil(len * 0.75)).toString('base64').slice(0, len)
        .replace(/\+/g, 'A').replace(/\//g, 'B');
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
    async toggleStatus(
        id: number,
        userId: number,
    ): Promise<any | null> {
        const school = await this.schoolRepo.findOne({ where: { id } });
        if (!school) return null;

        const oldValue = school.status;
        const newValue = oldValue === 1 ? 2 : 1;

        school.status = newValue;

        const saved = await this.schoolRepo.save(school);

        // optional: add audit log here using oldValue, newValue, userId, lang
        return saved;
    }
}
