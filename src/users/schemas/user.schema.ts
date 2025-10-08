import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'src/common/enums/role.enum';
import { Status } from 'src/common/enums/status-active.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ default: '' })
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ enum: Status, default: Status.INACTIVE })
  status: Status;

  @Prop({ type: Number, required: false })
  otp?: number;

  @Prop({ type: Date, required: false })
  otpExpiresAt?: Date;

  @Prop({
    type: [{ resource: { type: String }, permissions: [String] }],
    default: [],
    _id: false,
  })
  permissions: { resource: string; permissions: string[] }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
