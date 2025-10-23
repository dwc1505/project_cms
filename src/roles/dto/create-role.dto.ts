import { IsOptional, IsNotEmpty, IsArray } from 'class-validator';
import { PermissionDto } from './permission.dto';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  permissions?: PermissionDto[];
}
