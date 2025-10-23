import { SetMetadata } from '@nestjs/common';
import { Action } from 'src/common/enums/role.enum';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (resource: string, actions: Action[]) =>
  SetMetadata(PERMISSIONS_KEY, { resource, permissions: actions });
