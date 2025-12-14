import http from 'node:http';
import app from '../../app.js';
import { connectDatabase } from '../../config/database.js';

/**
 * Start an ephemeral HTTP server using the Express app on a random free port.
 * Ensures DB is initialized (and falls back to mock data).
 * @returns {Promise<{ server: import('http').Server, url: string, close: () => Promise<void> }>}
 */
export async function startTestServer() {
  // Force mock mode (no Mongo URI)
  process.env.MONGO_URI = process.env.MONGO_URI || '';

  // Ensure Basic Auth is enabled for mutating endpoints
  process.env.BASIC_AUTH_ENABLED = process.env.BASIC_AUTH_ENABLED || 'true';

  await connectDatabase();

  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const address = server.address();
  const url = `http://127.0.0.1:${address.port}`;

  const close = () =>
    new Promise((resolve) => server.close(() => resolve()));

  return { server, url, close };
}