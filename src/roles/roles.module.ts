import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import {
  Resource,
  ResourceSchema,
} from 'src/resources/schemas/resource.schema';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Resource.name, schema: ResourceSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [MongooseModule, RolesService],
})
export class RolesModule {}
