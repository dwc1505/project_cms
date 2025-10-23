import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { Comment, CommentSchema } from 'src/comments/schemas/comment.schema';
import { RolesModule } from 'src/roles/roles.module';
import { PostsScheduler } from './posts.scheduler';
import { BullModule } from '@nestjs/bull';
import { PostsProcessor } from './posts.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'postQueue',
    }),
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    RolesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsProcessor, PostsScheduler],
  exports: [PostsService],
})
export class PostsModule {}
