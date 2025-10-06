import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateResourceDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;
}
