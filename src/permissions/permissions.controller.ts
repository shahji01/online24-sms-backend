import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { Response } from 'express';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(
    @Body() dto: { permission_name: string },
    @Res() response: Response,
  ) {
    const result = await this.permissionsService.create(dto);

    return response
      .status(result.success ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST)
      .json(result);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.permissionsService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: { permission_name: string },
    @Res() res: Response
  ) {
    const result = await this.permissionsService.update(+id, dto);
    const status = result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
    return res.status(status).json(result);
  }

//   @Delete(':id')
//   remove(@Param('id') id: number) {
//     return this.permissionsService.remove(+id);
//   }
}
