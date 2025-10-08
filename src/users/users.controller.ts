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
import { Resource, Permission } from 'src/common/enums/role.enum';
import { Permissions } from 'src/derector/permissions';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/constants';

@UseGuards(JwtAuthGuard, RolesPermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions(Resource.USER, Permission.CREATE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Permissions(Resource.USER, Permission.READ)
  findAll(@Query('page') page: number = DEFAULT_PAGE, @Query('limit') limit: number = DEFAULT_LIMIT) {
    return this.usersService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @Permissions(Resource.USER, Permission.READ)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Resource.USER, Permission.UPDATE)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions(Resource.USER, Permission.DELETE)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
