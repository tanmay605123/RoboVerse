import mongoose from 'mongoose';
import { ENV } from '../config/env';

let isConnected = false;

export async function connectMongo(): Promise<typeof mongoose | null> {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    const mongoUri = ENV.MONGODB_URI;
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`🍃 Connected to MongoDB Atlas / Local at: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err: any) {
    console.warn(`⚠️ MongoDB connection unavailable (${err.message}). Using hybrid in-memory/test fallback.`);
    return null;
  }
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🍃 Disconnected from MongoDB');
  }
}

export function getMongoHealthStatus() {
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = mongoose.connection.readyState;
  return {
    status: state === 1 ? 'up' : 'standby',
    readyState: state,
    stateDescription: stateMap[state] || 'unknown',
    host: mongoose.connection.host || 'local-fallback',
    dbName: mongoose.connection.name || 'roboverse',
  };
}

/**
 * Executes an operation inside a MongoDB multi-document transaction if replica set is active
 */
export async function withMongoTransaction<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  if (mongoose.connection.readyState !== 1) {
    // If not connected to real mongo, run operation directly
    return operation({} as any);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
