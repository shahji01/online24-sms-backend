import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { CreateSchoolDto } from './dto/school.dto';
import { SchoolService } from './school.service';

@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post('add-school')
  async create(@Body() dto: CreateSchoolDto) {
    try {
      await this.schoolService.create(dto);
      return {
        status: true,
        message: 'School Added Successfully',
      };
    } catch (e) {
      return {
        status: false,
        message: e.message || 'Failed to add school',
      };
    }
  }

  @Post('get-all-school')
  async findAll(@Body() body: any) {
    try {
      const result = await this.schoolService.findAll(body);
      return {
        status: true,
        message: 'Schools fetched successfully',
        data: result,
      };
    } catch (e) {
      return {
        status: false,
        message: e.message || 'Failed to fetch schools',
      };
    }
  }

  @Post('find-school')
  async findOne(@Body() body: any) {
    try {
      const result = await this.schoolService.findOne(body);
      return {
        status: true,
        message: 'School fetched successfully',
        data: result,
      };
    } catch (e) {
      return {
        status: false,
        message: e.message || 'Failed to fetch school',
      };
    }
  }
  @Put('update-school/:id')
  async update(@Param('id') id: number, @Body() dto: CreateSchoolDto) {
    try {
      const result = await this.schoolService.update(id, dto);
      return {
        status: true,
        message: 'School updated successfully',
        data: result,
      };
    } catch (e) {
      return {
        status: false,
        message: e.message || 'Failed to update school',
      };
    }
  }

  @Post('active-and-inactive')
  async softDelete(@Body() body) {
    try {
      await this.schoolService.softDelete(body);
      return {
        status: true,
        message: `School ${body.status === 1 ? 'Activated' : 'Deactivated'} Successfully`,
      };
    } catch (e) {
      return {
        status: false,
        message: e.message || 'Failed to update status',
      };
    }
  }
}
