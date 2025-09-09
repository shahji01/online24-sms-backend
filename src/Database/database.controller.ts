import {
  Controller,
  Get,
  Delete,
  Param,
  Body,
  Post,
  UseGuards,
  HttpCode,
  Put,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DataSource } from 'typeorm';
import {
  TruncateTablesDto,
  DeleteRecordsDto,
} from './database.dto';
import { FileInterceptor } from '@nestjs/platform-express';
// import appropriate guards/decorators for permissions, e.g. PermissionsGuard
// import { Permissions } from '../auth/permissions.decorator';
// import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('database')
export class DatabaseController {
  constructor(
    private readonly db: DatabaseService,
    private readonly dataSource: DataSource
  ) {}

  @Get('tables')
  // @UseGuards(PermissionsGuard)
  // @Permissions('view-tables')
  async getTables() {
    const tables = await this.db.listTables();
    return { success: true, tables };
  }

  @Delete('truncate-selected')
  // @UseGuards(PermissionsGuard)
  // @Permissions('truncate-selected')
  async truncateSelected(@Body() dto: TruncateTablesDto) {
    await this.db.truncateTables(dto.tables);
    return { success: true, message: 'Selected tables truncated.' };
  }

  @Get('table-records/:tableName')
  // @UseGuards(PermissionsGuard)
  // @Permissions('view-table-records')
  async getTableRecords(@Param('tableName') tableName: string) {
    const records = await this.db.getTableRecords(tableName);
    return { success: true, records };
  }

  // @Post('delete-records/:tableName')
  // // @UseGuards(PermissionsGuard)
  // // @Permissions('delete-records')
  // @HttpCode(200)
  // async deleteRecords(
  //   @Param('tableName') tableName: string,
  //   @Body() dto: DeleteRecordsDto
  // ) {
  //   await this.db.deleteRecords(tableName, {
  //     ids: dto.ids,
  //     records: dto.records,
  //   });
  //   return { success: true, message: 'Records deleted.' };
  // }

  @Put("update-record/:tableName")
  async updateRecord(
    @Param("tableName") tableName: string,
    @Body("record") record: Record<string, any>
  ) {
    return this.db.updateRecord(tableName, record);
  }

  @Post('delete-records/:tableName')
  async deleteRecord(
    @Param("tableName") tableName: string,
    @Body("record") record: Record<string, any>
  ) {
    return this.db.deleteRecord(tableName, record);
  }

  @Post("import-table/:tableName")
  @UseInterceptors(FileInterceptor("file"))
  async importTable(
    @Param("tableName") tableName: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.db.importTableData(tableName, file);
  }
}
