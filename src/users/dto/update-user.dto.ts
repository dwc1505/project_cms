import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { Status } from 'src/common/enums/status-active.enum';

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @IsMongoId()
  roleId?: string;

  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be either active, inactive, or banned',
  })
  status?: Status;
}
