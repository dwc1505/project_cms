import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/derector/permissions';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const requiredPermissions = this.reflector.getAllAndOverride<{
      resource: string;
      permissions: string[];
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) return true;

    if (user.role === Role.ADMIN) return true;

    const userResourcePermissions = user.permissions?.find(
      (permission) =>
        permission.resource.toLowerCase() === requiredPermissions.resource.toLowerCase(),
    );

    if (
      !userResourcePermissions?.permissions ||
      userResourcePermissions.permissions.length === 0
    ) {
      throw new ForbiddenException('No permissions for this resource');
    }

    const requiredPermissionNames = requiredPermissions.permissions.map((perm) =>
      perm.toLowerCase(),
    );
    const userPermissionNames = userResourcePermissions.permissions.map((perm) =>
      perm.toLowerCase(),
    );

    const hasPermission = requiredPermissionNames.some((perm) =>
      userPermissionNames.includes(perm),
    );
    
    if (!hasPermission) throw new ForbiddenException('Forbidden permission');

    return true;
  }
}
