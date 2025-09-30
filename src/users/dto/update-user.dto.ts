import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { Status } from 'src/common/enums/status-active.enum';

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be either active, inactive, or banned',
  })
  status?: Status;
}
