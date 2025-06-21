import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

export interface FacebookUserData {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookAppData {
  id: string;
  name: string;
}

export interface GoogleUserData {
  sub: string; // Google user ID
  name: string;
  email: string;
  picture?: string;
  email_verified: boolean;
}

@Injectable()
export class SocialAuthService {
  private googleClient: OAuth2Client;

  constructor(private configService: ConfigService) {
    // Initialize Google OAuth client
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (googleClientId) {
      this.googleClient = new OAuth2Client(googleClientId);
    }
  }
  /**
   * Type guard to check if the response is a valid FacebookUserData
   */
  private isFacebookUserData(data: any): data is FacebookUserData {
    return (
      data &&
      typeof data === 'object' &&
      'id' in data &&
      'name' in data &&
      'email' in data &&
      typeof (data as Record<string, any>)['id'] === 'string' &&
      typeof (data as Record<string, any>)['name'] === 'string' &&
      typeof (data as Record<string, any>)['email'] === 'string'
    );
  }

  /**
   * Type guard to check if the response is a valid FacebookAppData
   */
  private isFacebookAppData(data: any): data is FacebookAppData {
    return (
      data &&
      typeof data === 'object' &&
      'id' in data &&
      'name' in data &&
      typeof (data as Record<string, any>)['id'] === 'string' &&
      typeof (data as Record<string, any>)['name'] === 'string'
    );
  }

  /**
   * Verify Facebook access token and retrieve user data
   */ async verifyFacebookToken(
    accessToken: string,
  ): Promise<FacebookUserData> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture.type(large)`,
      );

      // Validate user data response using type guard
      if (!this.isFacebookUserData(response.data)) {
        throw new UnauthorizedException('Invalid Facebook user data format');
      }

      // Validate that the token belongs to our app (optional but recommended)
      const appResponse = await axios.get(
        `https://graph.facebook.com/app?access_token=${accessToken}`,
      );

      // Validate app data response using type guard
      if (!this.isFacebookAppData(appResponse.data)) {
        throw new UnauthorizedException('Invalid Facebook app data format');
      }

      const expectedAppId = this.configService.get<string>('FACEBOOK_APP_ID');
      if (expectedAppId && appResponse.data.id !== expectedAppId) {
        throw new UnauthorizedException(
          'Facebook token does not belong to this app',
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify Facebook token');
    }
  }

  /**
   * Verify Google ID token and retrieve user data
   */
  async verifyGoogleToken(idToken: string): Promise<GoogleUserData> {
    try {
      if (!this.googleClient) {
        throw new BadRequestException('Google authentication not configured');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid Google ID token');
      }

      return {
        sub: payload.sub,
        name: payload.name || '',
        email: payload.email || '',
        picture: payload.picture,
        email_verified: payload.email_verified || false,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to verify Google token');
    }
  }

  /**
   * Validate and sanitize user data from social providers
   */
  validateSocialUserData(
    userData: FacebookUserData | GoogleUserData,
    provider: 'facebook' | 'google',
  ): boolean {
    if (!userData.email || !userData.name) {
      throw new BadRequestException(
        `${provider} account must have email and name`,
      );
    }

    // Additional validation can be added here
    return true;
  }
}
