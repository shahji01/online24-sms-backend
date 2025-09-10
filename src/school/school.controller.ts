import { BadRequestException, Body, Controller, NotFoundException, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { CreateSchoolDto } from './dto/school.dto';
import { SchoolService } from './school.service';

@Controller('schools')
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

  @Patch('toggle/:id')
  async toggleStatus(
    @Param('id') id: string,
    @Req() req,
  ) {
    const userId = req.user?.userId;

    const updated = await this.schoolService.toggleStatus(+id, userId);
    if (!updated) throw new NotFoundException('Record not found');

    return { message: 'Status updated successfully', data: updated };
  }
}
