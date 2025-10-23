import { IsEnum, IsOptional } from 'class-validator';
import { StatusPost } from 'src/common/enums/status-post';

export class UpdatePostDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  @IsEnum(StatusPost)
  status?: StatusPost;
}
