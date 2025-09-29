import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

// I don't see anywhere this class is used
export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
