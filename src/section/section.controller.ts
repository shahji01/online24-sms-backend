import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/section.dto';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post('add-section')
  async create(@Body() dto: CreateSectionDto) {
    try {
      await this.sectionService.create(dto);
      return { status: true, message: 'Section Added Successfully' };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to add section' };
    }
  }

  @Post('get-all-section')
  async findAll(@Body() body: any) {
    try {
      const result = await this.sectionService.findAll(body);
      return { status: true, message: 'Sections fetched successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to fetch sections' };
    }
  }

  @Post('find-section')
  async findOne(@Body() body: any) {
    try {
      const result = await this.sectionService.findOne(body);
      return { status: true, message: 'Section fetched successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to fetch section' };
    }
  }

  @Put('update-section/:id')
  async update(@Param('id') id: number, @Body() dto: CreateSectionDto) {
    try {
      const result = await this.sectionService.update(id, dto);
      return { status: true, message: 'Section updated successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to update section' };
    }
  }

  @Post('active-and-inactive')
  async softDelete(@Body() body: any) {
    try {
      await this.sectionService.softDelete(body);
      return {
        status: true,
        message: `Section ${body.status === 1 ? 'Activated' : 'Deactivated'} Successfully`,
      };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to update status' };
    }
  }
}
