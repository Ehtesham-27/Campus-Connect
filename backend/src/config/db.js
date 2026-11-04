import mongoose from 'mongoose';
import { ENV } from './env.js';

/**
 * Connect to MongoDB instance with resilient logging and error handling.
 */
export async function connectDB() {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection warning: ${error.message}`);
    console.warn('[MongoDB] Running in standalone mode. Note: Database features require an active MongoDB connection.');
    return null;
  }
}

/**
 * Get current database connection state
 */
export function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    readyState: stateCode,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Connection lost');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected successfully');
});

