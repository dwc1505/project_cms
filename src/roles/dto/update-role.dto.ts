import { IsOptional, IsArray } from 'class-validator';
import { PermissionDto } from './permission.dto';

export class UpdateRoleDto {
  @IsOptional()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  permissions?: PermissionDto[];
}
