import { SetMetadata } from '@nestjs/common';
import { Permission, Resource } from 'src/common/enums/role.enum';
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (resource: Resource, ...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, { resource, permissions });
