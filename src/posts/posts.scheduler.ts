import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostsService } from './posts.service';

@Injectable()
export class PostsScheduler {
  private readonly logger = new Logger(PostsScheduler.name);

  constructor(private readonly postsService: PostsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSyncLikesCron() {
    this.logger.log('Start loading redis -> db');
    const result = await this.postsService.syncLikesFromRedis();
    this.logger.log(
      `Sync completed: ${result.results?.length || 0} posts updated.`,
    );
  }
}
