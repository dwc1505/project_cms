import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Comment, CommentDocument } from 'src/comments/schemas/comment.schema';
import { StatusPost } from 'src/common/enums/status-post';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from 'src/helper/util';
import { RedisService } from 'src/redis/redis.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentsModel: Model<CommentDocument>,
    private readonly redis: RedisService,
    @InjectQueue('postQueue') private readonly postQueue: Queue,
  ) {}

  private getLikesKey(postId: string) {
    return `post:${postId}:likes`;
  }

  private getDislikesKey(postId: string) {
    return `post:${postId}:dislikes`;
  }

  async create(createPostDto: CreatePostDto, authorId: string) {
    const { title, content } = createPostDto;

    const isExist = await this.postModel.findOne({ title });
    if (isExist)
      throw new BadRequestException(`Title '${title}' already exists`);

    const post = new this.postModel({ title, content, author: authorId });
    return post.save();
  }

  async findAll(
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_PER_PAGE,
    authorId?: string,
    statusPost?: StatusPost,
  ) {
    if (authorId && !Types.ObjectId.isValid(authorId)) {
      throw new BadRequestException(`Invalid authorId: ${authorId}`);
    }
    if (statusPost && !Object.values(StatusPost).includes(statusPost)) {
      throw new BadRequestException(`Invalid statusPost: ${statusPost}`);
    }
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (authorId) filter.author = authorId;
    if (statusPost) filter.status = statusPost;

    const [data, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'name email')
        .populate({
          path: 'comments',
          select: 'content createdAt',
          options: { sort: { createdAt: -1 } },
          populate: { path: 'author', select: 'name email' },
        })
        .populate('likes', 'email')
        .populate('dislikes', 'email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    const result = data.map((post) => ({
      ...post,
      totalLikes: post.likes?.length || 0,
      totalDislikes: post.dislikes?.length || 0,
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: result,
    };
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('author', 'email')
      .populate({
        path: 'comments',
        select: 'content createdAt',
        populate: { path: 'author', select: 'email' },
        options: { sort: { createdAt: -1 } },
      })
      .populate('likes', 'email')
      .populate('dislikes', 'email')
      .lean();
    if (!post) throw new NotFoundException('Post not found');
    return {
      totalLikes: post.likes?.length || 0,
      totalDislikes: post.dislikes?.length || 0,
      post,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, { $set: updatePostDto }, { new: true })
      .populate('author', 'id name email');

    if (!updatedPost) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return {
      message: `Post updated successfully`,
      updatedPost,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    const post = await this.postModel
      .findByIdAndDelete(id)
      .populate('author', 'id name email');

    if (!post) throw new NotFoundException(`Post with id ${id} not found`);

    return {
      message: 'Post deleted successfully',
      post,
    };
  }

  async addComment(postId: string, userId: string, content: string) {
    const comment = await this.commentsModel.create({
      post: postId,
      author: userId,
      content,
    });

    await this.postModel.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    const comments = await this.commentsModel
      .findById(comment._id)
      .populate('author', 'email')
      .lean();
    return {
      message: 'Comment successfully',
      comments,
    };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException(`Post with id ${postId} not found`);

    const likesKey = this.getLikesKey(postId);
    const dislikesKey = this.getDislikesKey(postId);

    const [isLiked, isDisliked] = await Promise.all([
      this.redis.sismember(likesKey, userId),
      this.redis.sismember(dislikesKey, userId),
    ]);

    if (isLiked) {
      await this.redis.srem(likesKey, userId);
    } else {
      await this.redis.sadd(likesKey, userId);
      if (isDisliked) await this.redis.srem(dislikesKey, userId);
    }

    return this.reactionPost(postId);
  }

  async dislikePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const likesKey = this.getLikesKey(postId);
    const dislikesKey = this.getDislikesKey(postId);

    const [isLiked, isDisliked] = await Promise.all([
      this.redis.sismember(likesKey, userId),
      this.redis.sismember(dislikesKey, userId),
    ]);

    if (isDisliked) {
      await this.redis.srem(dislikesKey, userId);
    } else {
      await this.redis.sadd(dislikesKey, userId);
      if (isLiked) await this.redis.srem(likesKey, userId);
    }

    return this.reactionPost(postId);
  }

  async reactionPost(postId: string) {
    const [usersLikeIds, usersDislikeIds] = await Promise.all([
      this.redis.smembers(this.getLikesKey(postId)),
      this.redis.smembers(this.getDislikesKey(postId)),
    ]);
    const [usersLike, usersDislike] = await Promise.all([
      this.postModel.db
        .model('User')
        .find({ _id: { $in: usersLikeIds } })
        .select('name email')
        .lean(),
      this.postModel.db
        .model('User')
        .find({ _id: { $in: usersDislikeIds } })
        .select('name email')
        .lean(),
    ]);

    return {
      message: 'Like/Dislikes load to cache',
      postId,
      likeCount: usersLikeIds.length,
      dislikeCount: usersDislikeIds.length,
      usersLike,
      usersDislike,
    };
  }

  async syncLikesFromRedis() {
    const posts = (await this.postModel.find().select('likes dislikes')) as {
      id: Types.ObjectId;
      likes: Types.ObjectId[];
      dislikes: Types.ObjectId[];
    }[];
    const updatedResults: {
      postId: string;
      likes: number;
      dislikes: number;
    }[] = [];

    await Promise.all(
      posts.map(async (post) => {
        const postId = post.id.toString();

        // get likes and dislikes from redis cache
        const [likeIds, dislikeIds] = await Promise.all([
          this.redis.smembers(`post:${postId}:likes`).catch(() => []),
          this.redis.smembers(`post:${postId}:dislikes`).catch(() => []),
        ]);

        const [likeObjs, dislikeObjs] = [likeIds, dislikeIds].map((ids) =>
          ids.map((id) => new Types.ObjectId(id)),
        );

        const [dbLikeSet, dbDislikeSet, redisLikeSet, redisDislikeSet] = [
          post.likes,
          post.dislikes,
          likeIds,
          dislikeIds,
        ].map((ids) => new Set(ids.map?.((id) => id.toString()) || ids));

        // compare db likes/dislikes with redis
        const likesChange =
          dbLikeSet.size !== redisLikeSet.size ||
          [...dbLikeSet].some((id) => !redisLikeSet.has(id));
        const dislikesChange =
          dbDislikeSet.size !== redisDislikeSet.size ||
          [...dbDislikeSet].some((id) => !redisDislikeSet.has(id));

        if (likesChange || dislikesChange) {
          await this.postModel.findByIdAndUpdate(postId, {
            likes: likeObjs,
            dislikes: dislikeObjs,
            likeCount: likeObjs.length,
            dislikeCount: dislikeObjs.length,
          });

          updatedResults.push({
            postId,
            likes: likeObjs.length,
            dislikes: dislikeObjs.length,
          });
        }
      }),
    );

    return updatedResults.length
      ? { message: 'Sync complete', results: updatedResults }
      : { message: 'No posts updated' };
  }
}
