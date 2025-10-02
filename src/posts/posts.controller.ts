import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  Patch,
  Query,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { Permission, Resource } from 'src/common/enums/role.enum';
import { Permissions } from 'src/derector/permissions';
import { RolesPermissionsGuard } from 'src/auth/passport/roles-permissions.guard';

@UseGuards(JwtAuthGuard, RolesPermissionsGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Permissions(Resource.POST, Permission.CREATE)
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get()
  @Permissions(Resource.POST, Permission.READ)
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 3) {
    return this.postsService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @Permissions(Resource.POST, Permission.CREATE)
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Resource.POST, Permission.UPDATE)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @Permissions(Resource.POST, Permission.DELETE)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
