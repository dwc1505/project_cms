import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { PostsService } from './posts.service';

@Processor('postQueue')
export class PostsProcessor {
  constructor(private readonly postsService: PostsService) {}

  @Process('syncReacts')
  async handleSyncLikes(job: Job) {
    console.log('Running syncLikesFromRedis queue');
    const result = await this.postsService.syncLikesFromRedis();
    console.log('Sync result:', result);
  }
}
