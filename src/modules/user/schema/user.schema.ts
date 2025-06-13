import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  LANDLORD = 'landlord',
  FOOD_PROVIDER = 'food_provider',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  supabaseUserId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);