import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index.js';
import { httpLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { authOptional } from './middleware/auth.js';

const app = express();

// Security & parsers
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Logging
app.use(httpLogger);

// Optional auth attaches req.user when present
app.use(authOptional());

// Routes
app.use('/', routes);

// Health check
app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' }, error: null, message: 'Healthy' }));

// 404 and Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;