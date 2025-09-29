import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { Role } from "src/common/enums/role.enum";
import { Status } from "src/common/enums/status-active.enum";
// user single quotes or double quotes?

export class CreateUserDto {
  @IsNotEmpty()
  name?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsOptional()
  @IsEnum(Status, { message: 'Status phải là active, inactive hoặc banned' })
  status?: Status;

}
