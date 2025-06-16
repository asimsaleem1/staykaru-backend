import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Country } from './country.schema';

@Schema({ timestamps: true })
export class City extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Country', required: true })
  country: Country;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: string;
    coordinates: number[];
  };
}

export const CitySchema = SchemaFactory.createForClass(City);
CitySchema.index({ location: '2dsphere' });
