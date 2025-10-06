import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { PERMISSIONS_KEY } from 'src/derector/permissions';
import { Action } from 'src/common/enums/role.enum';
import {
  Resource,
  ResourceDocument,
} from 'src/resources/schemas/resource.schema';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  private readonly logger = new Logger(RolesPermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    const requiredPermissions = this.reflector.getAllAndOverride<{
      resource: string;
      permissions: Action[];
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredPermissions) return true;

    const role = user.roleId
      ? await this.roleModel.findById(user.roleId).lean().exec()
      : null;
    if (!role) throw new ForbiddenException('Role not found');

    if (role.name.toLowerCase() === 'admin') return true;

    // map resource id resource name
    const rolePermissions = await Promise.all(
      role.permissions.map(async (rolePerm) => {
        const resource = await this.resourceModel.findById(rolePerm.resource).lean().exec();
        return {
          resourceName: resource?.name,
          allowedActions: rolePerm.actions,
        };
      }),
    );

    // Find permission for the required resource
    const resourcePermission = rolePermissions.find(
      (perm) => perm.resourceName === requiredPermissions.resource,
    );
    if (!resourcePermission || resourcePermission.allowedActions.length === 0) {
      throw new ForbiddenException('No permissions for this resource');
    }

    // Check if all required actions are allowed
    const hasAllRequiredActions = requiredPermissions.permissions.every((action) =>
      resourcePermission.allowedActions.includes(action),
    );
    if (!hasAllRequiredActions) throw new ForbiddenException('Forbidden permission');

    return true;
  }
}
