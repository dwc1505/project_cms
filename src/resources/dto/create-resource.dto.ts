import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;
}
