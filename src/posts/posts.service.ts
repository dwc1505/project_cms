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


@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentsModel: Model<CommentDocument>,
  ) {}

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
        .populate('author', 'name email status')
        .populate({
          path: 'comments',
          select: 'content createdAt',
          options: { sort: { createdAt: -1 } },
          populate: { path: 'author', select: 'name email' },
        })
        .populate('likes', 'name email')
        .populate('dislikes', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
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
      .populate('dislikes', 'email');
    if (!post) throw new NotFoundException('Post not found');
    return post;
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
    if (!post) throw new NotFoundException('Post not found');

    post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);

    // Toggle like
    if (post.likes.includes(userId as any)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId as any);
    }

    await post.save();

    return this.postModel
      .findById(postId)
      .populate('comments', 'content')
      .populate('likes', 'email')
      .populate('dislikes', 'email')
      .lean()
      .exec();
  }

  async dislikePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    post.likes = post.likes.filter((id) => id.toString() !== userId);

    // Toggle dislike
    if (post.dislikes.includes(userId as any)) {
      post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
    } else {
      post.dislikes.push(userId as any);
    }

    await post.save();

    return this.postModel
      .findById(postId)
      .populate('comments', 'content')
      .populate('likes', 'email')
      .populate('dislikes', 'email')
      .lean()
      .exec();
  }
}
