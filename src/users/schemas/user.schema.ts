import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
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

  @Prop({ type: Types.ObjectId, ref: 'Role', default: null })
  roleId: Types.ObjectId;

  @Prop({ enum: Status, default: Status.INACTIVE })
  status: Status;

  @Prop({ type: Number, required: false })
  otp?: number;

  @Prop({ type: Date, required: false })
  otpExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
