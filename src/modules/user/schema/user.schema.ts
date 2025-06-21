import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  LANDLORD = 'landlord',
  FOOD_PROVIDER = 'food_provider',
  ADMIN = 'admin',
}

export enum IdentificationType {
  CNIC = 'cnic',
  PASSPORT = 'passport',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Plain text password as per requirement

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  countryCode: string; // Country code for phone number

  @Prop()
  address: string;

  @Prop({ required: true })
  gender: string;

  @Prop()
  profileImage?: string; // URL to profile image

  @Prop({ enum: IdentificationType })
  identificationType?: IdentificationType; // CNIC or Passport

  @Prop()
  identificationNumber?: string; // CNIC or Passport number

  @Prop({ type: [String], default: [] })
  fcmTokens: string[]; // Array to support multiple devices per user

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  deactivatedBy?: User;

  @Prop()
  deactivatedAt?: Date;

  @Prop()
  deactivationReason?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ default: 0 })
  failedLoginAttempts: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
