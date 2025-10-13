import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { Comment, CommentSchema } from 'src/comments/schemas/comment.schema';
import { PostQueueModule } from './post-queue.module';
import { RolesModule } from 'src/roles/roles.module';
import { PostsScheduler } from './posts.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    RolesModule,
    forwardRef(() => PostQueueModule),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsScheduler],
  exports: [PostsService],
})
export class PostsModule {}
