import mongoose from 'mongoose';

let isConnected = false;
/**
 * Indicates whether the app should use mock data.
 * True when no MONGO_URI is provided or a connection cannot be established.
 */
let useMockData = false;

/**
 * Connect to MongoDB if MONGO_URI is provided. Falls back to mock data on failure.
 * @returns {Promise<void>}
 */
export async function connectDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    useMockData = true;
    console.warn('[DB] No MONGO_URI provided. Falling back to mock in-memory data.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      // modern mongoose uses the global config; options left minimal intentionally
    });
    isConnected = true;
    useMockData = false;
    console.info('[DB] Connected to MongoDB.');
  } catch (err) {
    useMockData = true;
    isConnected = false;
    console.error('[DB] Failed to connect to MongoDB. Falling back to mock in-memory data.', err.message);
  }
}

export function dbState() {
  return { isConnected, useMockData };
}

