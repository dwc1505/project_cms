import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/derector/role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    // type of user is any
    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.includes(user.role?.toLowerCase());

    if (!hasRole) {
      // Change message to English: 'No permission to perform'
      throw new ForbiddenException('Không có quyền thực hiện');
    }
    return requiredRoles.includes(user.role);
  }
}
