import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { CampusService } from './campus.service';
import { CreateCampusDto } from '../campus/dto/campus.dto';

@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Post('add-campus')
  async create(@Body() dto: CreateCampusDto) {
    try {
      await this.campusService.create(dto);
      return { status: true, message: 'Campus Added Successfully' };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to add campus' };
    }
  }

  @Post('get-all-campus')
  async findAll(@Body() body: any) {
    try {
      const result = await this.campusService.findAll(body);
      return { status: true, message: 'Campuses fetched successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to fetch campuses' };
    }
  }

  @Post('find-campus')
  async findOne(@Body() body: any) {
    try {
      const result = await this.campusService.findOne(body);
      return { status: true, message: 'Campus fetched successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to fetch campus' };
    }
  }

  @Put('update-campus/:id')
  async update(@Param('id') id: number, @Body() dto: CreateCampusDto) {
    try {
      const result = await this.campusService.update(id, dto);
      return { status: true, message: 'Campus updated successfully', data: result };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to update campus' };
    }
  }

  @Post('active-and-inactive')
  async softDelete(@Body() body: any) {
    try {
      await this.campusService.softDelete(body);
      return {
        status: true,
        message: `Campus ${body.status === 1 ? 'Activated' : 'Deactivated'} Successfully`,
      };
    } catch (e) {
      return { status: false, message: e.message || 'Failed to update status' };
    }
  }
}
