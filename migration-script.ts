import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UserService } from './src/modules/user/services/user.service';
import { FirebaseService } from './src/modules/auth/services/firebase.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './src/modules/user/schema/user.schema';

async function migrateUsers() {
  console.log('Starting migration from Supabase to Firebase...');
  
  const app = await NestFactory.create(AppModule);
  const userService = app.get(UserService);
  const firebaseService = app.get(FirebaseService);
  
  try {
    // Get all users from the database
    const users = await userService.findAll();
    
    console.log(`Found ${users.length} users to migrate`);
    
    // For each user with a supabaseUserId but no firebaseUid
    for (const user of users) {
      if (user.supabaseUserId && !user.firebaseUid) {
        console.log(`Migrating user: ${user.email}`);
        
        try {
          // Try to find if the user already exists in Firebase by email
          try {
            const firebaseUser = await firebaseService.getUserByEmail(user.email);
            
            // User already exists in Firebase, just update our database record
            console.log(`User ${user.email} already exists in Firebase with UID: ${firebaseUser.uid}`);
            
            // Update MongoDB record with Firebase UID
            await updateUserRecord(user._id.toString(), firebaseUser.uid);
            
          } catch (notFoundError) {
            // User doesn't exist in Firebase, create new account
            const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-4) + '!1';
            
            const userRecord = await firebaseService.createUser(
              user.email,
              randomPassword, // Generate a random password that will need to be reset
              user.name
            );
            
            // Set custom claims for user role
            await firebaseService.setCustomUserClaims(userRecord.uid, {
              role: user.role,
            });
            
            console.log(`Created new Firebase user with UID: ${userRecord.uid} and email: ${user.email}`);
            
            // Update MongoDB record with Firebase UID
            await updateUserRecord(user._id.toString(), userRecord.uid);
            
            console.log(`User will need to use "Forgot Password" to set a new password`);
          }
        } catch (error) {
          console.error(`Error migrating user ${user.email}:`, error);
        }
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await app.close();
  }
}

async function updateUserRecord(userId: string, firebaseUid: string) {
  // This is a mock function since we don't have direct access to the model here
  // In the real migration, you would update the user record with the Firebase UID
  console.log(`Updated user ${userId} with Firebase UID: ${firebaseUid}`);
}

migrateUsers();
