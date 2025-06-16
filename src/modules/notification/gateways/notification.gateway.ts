import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.auth.token as string;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      // Verify JWT token
      const decodedToken = this.jwtService.verify<JwtPayload>(token);
      if (!decodedToken || !decodedToken.sub) {
        client.disconnect();
        return;
      }

      const userId = decodedToken.sub;

      // Store socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);

      // Join user-specific room
      await client.join(`user:${userId}`);
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    // Remove socket connection
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any): void {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
