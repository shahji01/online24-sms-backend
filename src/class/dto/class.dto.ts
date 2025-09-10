import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty({ message: 'Class name cannot be empty' })
  @IsString({ message: 'Class name must be a string' })
  className: string;

  @IsNotEmpty({ message: 'Number of students cannot be empty' })
  @IsNumber({}, { message: 'Number of students must be a number' })
  noOfStudents: number;

  @IsNotEmpty({ message: 'Section ID is required' })
  @IsNumber({}, { message: 'Section ID must be a number' })
  sectionId: number;
}
