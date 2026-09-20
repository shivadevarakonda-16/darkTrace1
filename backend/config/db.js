import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connects to MongoDB Atlas using MONGODB_URI from .env.
 * The rest of the app is designed to keep working (against the in-memory
 * seed dataset) even if this fails to connect, so a missing/incorrect
 * .env never blocks local demo usage.
 */
export async function connectMongo() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set in .env — running on in-memory seed data only.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas:', mongoose.connection.name);
    return true;
  } catch (err) {
    console.error('❌ MongoDB Atlas connection failed:', err.message);
    console.warn('⚠️  Falling back to in-memory seed data only.');
    return false;
  }
}

export function mongoReady() {
  return isConnected && mongoose.connection.readyState === 1;
}
