import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { Action } from 'src/common/enums/role.enum';

interface Permission {
  resource: Types.ObjectId;
  actions: Action[];
}

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    type: [
      {
        resource: { type: Types.ObjectId, ref: 'Resource', required: true },
        actions: { type: [String], enum: Object.values(Action), default: [] },
      },
    ],
    default: [],
  })
  permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
