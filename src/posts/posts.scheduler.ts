import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class PostsScheduler {
  constructor(
    @InjectQueue('postQueue') private readonly postQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    console.log('Queue syncReacts job');
    await this.postQueue.add('syncReacts', {});
  }
}
