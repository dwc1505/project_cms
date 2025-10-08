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
import { RolesPermissionsGuard } from 'src/auth/passport/roles-permissions.guard';
import { Permissions } from 'src/derector/permissions';
import { Action } from 'src/common/enums/role.enum';
import { StatusPost } from 'src/common/enums/status-post';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from 'src/helper/util';


@UseGuards(JwtAuthGuard, RolesPermissionsGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Permissions('post', [Action.CREATE])
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @Get()
  @Permissions('post', [Action.READ])
  findAll(
    @Query('page') page: number = DEFAULT_PAGE,
    @Query('limit') limit: number = DEFAULT_PER_PAGE,
    @Query('authorId') authorId?: string,
    @Query('statusPost') statusPost?: StatusPost,
  ) {
    return this.postsService.findAll(
      Number(page),
      Number(limit),
      authorId,
      statusPost,
    );
  }

  @Get(':id')
  @Permissions('post', [Action.READ])
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('post', [Action.UPDATE])
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @Permissions('post', [Action.DELETE])
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/comment')
  addComment(
    @Param('id') postId: string,
    @Request() req,
    @Body('content') content: string,
  ) {
    return this.postsService.addComment(postId, req.user.sub, content);
  }

  @Post(':id/like')
  like(@Param('id') postId: string, @Request() req) {
    return this.postsService.likePost(postId, req.user.sub);
  }

  @Post(':id/dislike')
  dislike(@Param('id') postId: string, @Request() req) {
    return this.postsService.dislikePost(postId, req.user.sub);
  }
}
