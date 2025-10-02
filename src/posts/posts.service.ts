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

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto, authorId: string) {
    const { title, content } = createPostDto;

    const isExist = await this.postModel.findOne({ title });
    if (isExist)
      throw new BadRequestException(`Title '${title}' already exists`);

    const post = new this.postModel({ title, content, author: authorId });
    return post.save();
  }

  async findAll(page: number = 1, limit: number = 3) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.postModel
        .find()
        .populate('author', 'id name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.postModel.countDocuments().exec(),
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
      .populate('author', 'id name email');
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
}
