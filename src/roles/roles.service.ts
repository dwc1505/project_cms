import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Action } from 'src/common/enums/role.enum';
import { Resource } from 'src/resources/schemas/resource.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Resource.name) private resourceModel: Model<Resource>,
  ) {}

  private async validatePermissions(
    permissions?: { resource: string; actions: string[] }[],
  ): Promise<{ resource: Types.ObjectId; actions: Action[] }[]> {
    if (!permissions) return [];

    const mapPer: { resource: Types.ObjectId; actions: Action[] }[] = [];
    const invalidResources: string[] = [];

    for (const p of permissions) {
      // valid format obj
      if (!Types.ObjectId.isValid(p.resource)) {
        invalidResources.push(p.resource);
        continue;
      }

      // valid resource
      const resourceExists = await this.resourceModel.findById(p.resource);
      if (!resourceExists) {
        invalidResources.push(p.resource);
        continue;
      }

      // Valid action
      const actions: Action[] = p.actions.map((a) => {
        if (!Object.values(Action).includes(a as Action)) {
          throw new BadRequestException(`Invalid action: '${a}'`);
        }
        return a as Action;
      });

      mapPer.push({
        resource: new Types.ObjectId(p.resource),
        actions,
      });
    }

    if (invalidResources.length > 0) {
      throw new BadRequestException(
        `The resources do not exist: ${invalidResources.join(', ')}`,
      );
    }

    // check duplicate resource
    const resourceIds = mapPer.map((p) => p.resource.toString());
    if (new Set(resourceIds).size !== resourceIds.length) {
      throw new BadRequestException('Duplicate resource in permissions');
    }

    return mapPer;
  }

  async create(createRoleDto: CreateRoleDto) {
    const { name, description, permissions } = createRoleDto;

    const exists = await this.roleModel.findOne({ name });
    if (exists) {
      throw new BadRequestException(`Role ${name} already exists`);
    }

    const mapPer = await this.validatePermissions(permissions);

    const role = await this.roleModel.create({
      name,
      description,
      permissions: mapPer,
    });

    return {
      message: 'Role created successfully',
      role,
    };
  }

  async findAll() {
    return this.roleModel
      .find()
      .populate('permissions.resource', 'name')
      .exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    const role = await this.roleModel
      .findById(id)
      .populate('permissions.resource', 'name');
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { name, description, permissions } = updateRoleDto;

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    if (name) {
      const exists = await this.roleModel.findOne({ name, _id: { $ne: id } });
      if (exists) throw new BadRequestException(`Role ${name} already exists`);
    }

    let mapPer;
    if (permissions) {
      mapPer = await this.validatePermissions(permissions);
    }

    const updatedRole = await this.roleModel
      .findByIdAndUpdate(
        id,
        { $set: { name, description, permissions: mapPer } },
        { new: true },
      )
      .populate('permissions.resource', 'name');

    if (!updatedRole) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return {
      message: 'Role updated successfully',
      updatedRole,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    const deletedRole = await this.roleModel.findByIdAndDelete(id).exec();

    if (!deletedRole) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return {
      message: 'Role removed successfully',
      deletedRole,
    };
  }
}
