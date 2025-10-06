import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { RolesModule } from 'src/roles/roles.module';
import { Comment, CommentSchema } from 'src/comments/schemas/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    RolesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
