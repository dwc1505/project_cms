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

    const resourcePermissions = user.permissions?.find(
      (r) =>
        r.resource.toLowerCase() === requiredPermissions.resource.toLowerCase(),
    );

    if (
      !resourcePermissions?.permissions ||
      resourcePermissions.permissions.length === 0
    ) {
      throw new ForbiddenException('No permissions for this resource');
    }

    const requiredPerms = requiredPermissions.permissions.map((p) =>
      p.toLowerCase(),
    );
    const userPerms = resourcePermissions.permissions.map((p) =>
      p.toLowerCase(),
    );

    const hasPermission = requiredPerms.some((rp) => userPerms.includes(rp));
    if (!hasPermission) throw new ForbiddenException('Forbidden permission');

    return true;
  }
}
