import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResourceDocument = Resource & Document;

@Schema({ timestamps: true })
export class Resource {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
