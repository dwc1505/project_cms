// src/redis/redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: 'redis://localhost:6379' });
  }

  async onModuleInit() {
    await this.client.connect();
    console.log('Redis connected');
  }

  async sadd(key: string, member: string) {
    return this.client.sAdd(key, member);
  }

  async srem(key: string, member: string) {
    return this.client.sRem(key, member);
  }

  async sismember(key: string, member: string) {
    return this.client.sIsMember(key, member);
  }

  async scard(key: string) {
    return this.client.sCard(key);
  }

  async smembers(key: string) {
    return this.client.sMembers(key);
  }

  async keys(pattern: string) {
    return this.client.keys(pattern);
  }

  async del(key: string) {
    return this.client.del(key);
  }
}
