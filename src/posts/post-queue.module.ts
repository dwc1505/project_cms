import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { BullModule } from '@nestjs/bull';
import { PostsModule } from './posts.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    BullModule.registerQueue({ name: 'postQueue' }),
    forwardRef(() => PostsModule),
  ],
  providers: [RedisService],
  exports: [BullModule],
})
export class PostQueueModule {}
