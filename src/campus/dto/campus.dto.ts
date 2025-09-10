import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCampusDto {
  @IsNotEmpty({ message: 'Campus name cannot be empty' })
  @IsString({ message: 'Campus name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Address cannot be empty' })
  @IsString({ message: 'Address must be a string' })
  address: string;

  @IsNotEmpty({ message: 'Contact cannot be empty' })
  @IsString({ message: 'Contact number must be a string' })
  contact_no: string;

  @IsNotEmpty({ message: 'School ID is required' })
  @IsInt({ message: 'School ID must be a number' })
  school_id: number;
}