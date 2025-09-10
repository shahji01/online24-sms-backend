import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSectionDto {
  @IsNotEmpty({message : "Section Cannot be Empty"})
  @IsString({message : "Section Should be in String"})
  name: string;

  @IsNotEmpty({message : "Campus ID Cannot be empty"})
  @IsNumber()
  campusId: number;
}
