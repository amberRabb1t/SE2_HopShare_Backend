import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index.js';
import { httpLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { authOptional } from './middleware/auth.js';

/*
    Main application setup; configures middleware, routes, 
    parsing and error handling.
*/

const app = express(); // Create Express app

//-------------
// Middleware |
//-------------

app.use(helmet()); // Security headers
app.use(cors()); // Cross-Origin Resource Sharing (CORS)

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(httpLogger); // Logging
app.use(authOptional()); // Optional auth attaches req.user when present
app.use('/', routes); // Endpoint routes

// Health check
app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' }, error: null, message: 'Healthy' }));

app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Generic error handler

export default app; // Export the app instance for server.js to use

