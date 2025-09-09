import {
  Body,
  Controller,
  Delete,
  Get,
  Res,
  HttpStatus,
  Param,
  Post,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { Response } from 'express';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(
    @Body() dto: { role_name: string; permissionIds?: number[] },
    @Res() response: Response,
  ) {
    const result = await this.rolesService.create(dto);
    const statusCode = result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
    return response.status(statusCode).json(result);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rolesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: { role_name: string; permissionIds: number[] }) {
    return this.rolesService.update(+id, dto);
  }

//   @Delete(':id')
//   remove(@Param('id') id: number) {
//     return this.rolesService.remove(+id);
//   }
}
