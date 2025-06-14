import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }  private initializeFirebase() {
    // Check if an app has already been initialized
    if (admin.apps.length === 0) {
      try {
        // Try to use service account file if available
        const serviceAccountPath = path.join(process.cwd(), 'service-account', 'staykaruapp-firebase-adminsdk.json');
        
        if (fs.existsSync(serviceAccountPath)) {
          // Use service account file
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
          });
          console.log('Firebase initialized using service account file');
        } else {
          // Fall back to environment variables
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
              projectId: this.configService.get<string>('firebase.projectId'),
              clientEmail: this.configService.get<string>('firebase.clientEmail'),
              privateKey: this.configService.get<string>('firebase.privateKey'),
            }),
          });
          console.log('Firebase initialized using environment variables');
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
      }
    } else {
      this.firebaseApp = admin.app();
    }
  }

  getAuth() {
    return this.firebaseApp.auth();
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.getAuth().verifyIdToken(token);
    } catch (error) {
      throw error;
    }
  }

  async createUser(email: string, password: string, displayName: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });
    } catch (error) {
      throw error;
    }
  }

  async setCustomUserClaims(uid: string, claims: { [key: string]: any }): Promise<void> {
    try {
      await this.getAuth().setCustomUserClaims(uid, claims);
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().getUserByEmail(email);
    } catch (error) {
      throw error;
    }
  }

  async getUserById(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.getAuth().getUser(uid);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await this.getAuth().deleteUser(uid);
    } catch (error) {
      throw error;
    }
  }
}
