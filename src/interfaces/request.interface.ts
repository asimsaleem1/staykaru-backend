import { Request } from 'express';
import { User } from '../modules/user/schema/user.schema';

export interface AuthenticatedRequest extends Request {
  user: User & { _id: string };
}
