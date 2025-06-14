import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { FirebaseService } from './src/modules/auth/services/firebase.service';

async function testFirebaseConfig() {
  console.log('Testing Firebase configuration...');
  
  try {
    const app = await NestFactory.create(AppModule);
    const firebaseService = app.get(FirebaseService);
    
    console.log('Firebase service successfully initialized!');
    
    // Try to list users to test authentication
    try {
      const auth = firebaseService.getAuth();
      const listUsersResult = await auth.listUsers(1);
      
      console.log('Successfully connected to Firebase Auth!');
      console.log(`Total users in Firebase: ${listUsersResult.pageToken ? 'more than 1' : listUsersResult.users.length}`);
      
      console.log('Firebase configuration test completed successfully!');
    } catch (error) {
      console.error('Error connecting to Firebase Auth:', error);
      console.log('Please check your credentials and permissions.');
    }
    
    await app.close();
  } catch (error) {
    console.error('Failed to initialize Firebase service:', error);
  }
}

testFirebaseConfig();
