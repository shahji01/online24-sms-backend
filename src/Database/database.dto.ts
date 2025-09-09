import { IsArray, IsIn, IsOptional, IsString, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TruncateTablesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tables: string[];
}

export class DeleteRecordsByIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}

export class DeleteRecordsByFullDto {
  @IsArray()
  @ArrayNotEmpty()
  // each record is a loose object; you can tighten this if you know schema
  records: any[];
}

export class DeleteRecordsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @IsOptional()
  @IsArray()
  records?: any[];
}
