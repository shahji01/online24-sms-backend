import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolDto {
 @IsNotEmpty({ message: 'School name cannot be emoty' })
  @IsString({ message: 'School name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Address cannot be empty' })
  @IsString({ message: 'Address must be a string' })
  address: string;

  @IsNotEmpty({ message: 'Contact cannot be empty' })
  @IsString({ message: 'Contact number must be a string' })
  contact_no: string;

  @IsNotEmpty({ message: 'Admin email cannot be empty' })
  @IsEmail({}, { message: 'Admin email must be valid' })
  admin_email: string;

}