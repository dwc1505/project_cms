import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesPermissionsGuard } from 'src/auth/passport/roles-permissions.guard';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { Permissions } from 'src/derector/permissions';
import { Action } from 'src/common/enums/role.enum';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from 'src/helper/util';

@UseGuards(JwtAuthGuard, RolesPermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('user', [Action.CREATE])
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Permissions('user', [Action.READ])
  findAll(
    @Query('page') page: number = DEFAULT_PAGE,
    @Query('limit') limit: number = DEFAULT_PER_PAGE,
  ) {
    return this.usersService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @Permissions('user', [Action.READ])
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('user', [Action.UPDATE])
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions('user', [Action.DELETE])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
