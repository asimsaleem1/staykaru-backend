// remove-firebase-index.js
// This script removes the Firebase UID index from the users collection

const mongoose = require('mongoose');
require('dotenv').config();

async function removeFirebaseIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    const db = mongoose.connection;
    
    console.log('Listing indexes on users collection...');
    const indexes = await db.collection('users').indexes();
    console.log('Current indexes:', indexes);
    
    // Find if firebaseUid index exists
    const firebaseIndex = indexes.find(index => 
      index.key && index.key.firebaseUid !== undefined
    );
    
    if (firebaseIndex) {
      console.log('Found Firebase UID index, dropping it...');
      await db.collection('users').dropIndex(firebaseIndex.name);
      console.log('Firebase UID index dropped successfully');
    } else {
      console.log('No Firebase UID index found');
    }
    
    console.log('Updated indexes:');
    const updatedIndexes = await db.collection('users').indexes();
    console.log(updatedIndexes);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

removeFirebaseIndex();
