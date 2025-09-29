import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/common/enums/role.enum';
import { Status } from 'src/common/enums/status-active.enum';

export type CatDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status;
}

export const UserSchema = SchemaFactory.createForClass(User);