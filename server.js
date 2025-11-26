import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDatabase } from './config/database.js';

const PORT = Number(process.env.PORT || 3000);

async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`HopShare API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});