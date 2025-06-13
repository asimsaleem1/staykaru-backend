import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://assaleemofficial:Sarim786.@cluster0.9l5dppu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
}));