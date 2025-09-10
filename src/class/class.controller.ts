import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/class.dto';

@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post('add-class')
  async create(@Body() dto: CreateClassDto) {
    try {
      await this.classService.create(dto);
      return { status: true, message: 'Class Added Successfully' };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to add class' };
    }
  }

  @Post('get-all-class')
  async findAll(@Body() body: any) {
    try {
      const result = await this.classService.findAll(body);
      return { status: true, message: 'Classes fetched successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to fetch classes' };
    }
  }

  @Post('find-class')
  async findOne(@Body() body: any) {
    try {
      const result = await this.classService.findOne(body);
      return { status: true, message: 'Class fetched successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to fetch class' };
    }
  }

  @Put('update-class/:id')
  async update(@Param('id') id: number, @Body() dto: CreateClassDto) {
    try {
      const result = await this.classService.update(id, dto);
      return { status: true, message: 'Class updated successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to update class' };
    }
  }

  @Post('active-and-inactive')
  async softDelete(@Body() body: any) {
    try {
      await this.classService.softDelete(body);
      return {
        status: true,
        message: `Class ${body.status === 1 ? 'Activated' : 'Deactivated'} Successfully`,
      };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to update status' };
    }
  }
}
