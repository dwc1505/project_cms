import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  async create(createResourceDto: CreateResourceDto) {
    const exists = await this.resourceModel.findOne({
      name: createResourceDto.name,
    });
    if (exists)
      throw new BadRequestException(
        `Resource ${createResourceDto.name} already exists`,
      );

    const resource = await this.resourceModel.create(createResourceDto);

    return {
      message: 'Resource created successfully',
      resource,
    };
  }

  async findAll() {
    return this.resourceModel.find().exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Resource with id ${id} not found`);
    }

    const resource = await this.resourceModel.findById(id);
    if (!resource) {
      throw new NotFoundException(`Resource with id ${id} not found`);
    }

    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Resource with id ${id} not found`);
    }
    if (updateResourceDto.name) {
      const exists = await this.resourceModel.findOne({
        name: updateResourceDto.name,
        _id: { $ne: id },
      });
      if (exists)
        throw new BadRequestException(
          `Resource ${updateResourceDto.name} already exists`,
        );
    }

    const updatedResource = this.resourceModel
      .findByIdAndUpdate(id, updateResourceDto, { new: true })
      .exec();
    return {
      message: 'Resource updated successfully',
      updatedResource,
    };
  }

  async remove(id: string) {
    const resource = await this.resourceModel.findById(id).exec();
    if (!resource) {
      throw new NotFoundException(`Resource with id ${id} not found`);
    }

    const deletedResource = await this.resourceModel
      .findByIdAndDelete(id)
      .exec();
    return {
      message: `Resource deleted successfully`,
      deletedResource,
    };
  }
}
