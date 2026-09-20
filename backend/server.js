import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import actorsRouter from './routes/actors.js';
import attributionRouter from './routes/attribution.js';
import graphRouter from './routes/graph.js';
import scanRouter from './routes/scan.js';
import exportRouter from './routes/export.js';
import authRouter, { seedDefaultUsers } from './routes/auth.js';
import adminRouter from './routes/admin.js';

import { connectMongo, mongoReady } from './config/db.js';
import { dbStore } from './data/mockDatabase.js';
import Actor from './models/Actor.js';
import { authenticate } from './middleware/auth.js';
import { startScraperService } from './services/scraperService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
// CORS: wide open by default (fine for local dev / same-origin deploys).
// For a split deployment (frontend and backend on different domains), set
// CORS_ORIGIN in .env to your frontend's exact URL, e.g.
// CORS_ORIGIN=https://aegistrace.vercel.app
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin, credentials: true } : {}));
app.use(express.json());
app.use(morgan('dev'));

// Public routes
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AegisTrace Attribution Engine',
    version: '2.1.0-PROD',
    timestamp: new Date().toISOString(),
    mongoConnected: mongoReady(),
    modules: {
      infraScanner: 'ONLINE',
      identityGraph: 'ONLINE',
      stylometryEngine: 'ONLINE',
      cryptoCorrelation: 'ONLINE',
      fusionEngine: 'ONLINE',
    },
  });
});

// API welcome message at "/" — only when there's no built frontend to serve
// there instead (see the static-serving block below, which takes over "/"
// once frontend/dist exists).
if (!fs.existsSync(path.join(__dirname, '../frontend/dist'))) {
  app.get('/', (req, res) => {
    res.send({
      message: 'DarkTrace: Dark Web Threat Actor Attribution API is running.',
      docs: '/api/health',
    });
  });
}

// Everything below requires a logged-in user (admin OR investigator)
app.use('/api/actors', authenticate, actorsRouter);
app.use('/api/attribution', authenticate, attributionRouter);
app.use('/api/graph', authenticate, graphRouter);
app.use('/api/scan', authenticate, scanRouter);
app.use('/api/export', authenticate, exportRouter);

// Admin-only routes (role check happens inside admin.js)
app.use('/api/admin', adminRouter);

// --- Serve the built frontend (single-service deployment) ---------------
// If frontend/dist exists (i.e. `npm run build` was run in frontend/), serve
// it as static files and fall back to index.html for any non-API route, so
// the whole app — frontend + backend — can be deployed as ONE service with
// ONE URL (simplest option for hosts like Render/Railway). If dist doesn't
// exist (e.g. you're running the frontend separately via `npm run dev` or a
// separate static host), this block does nothing and only the API is served.
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  console.log('🖥️  Serving built frontend from', frontendDist);
}

async function hydrateFromMongoOrSeed() {
  if (!mongoReady()) return;

  const count = await Actor.countDocuments();
  if (count === 0) {
    // First boot against a fresh Atlas cluster: push the local seed dataset up
    console.log('📤 MongoDB Atlas is empty — pushing seed dataset...');
    await Actor.insertMany(dbStore.actors, { ordered: false }).catch(() => {});
  } else {
    // Existing cluster data takes precedence — hydrate in-memory store from it
    console.log(`📥 Hydrating in-memory dataset from MongoDB Atlas (${count} actors)...`);
    const docs = await Actor.find({}).lean();
    dbStore.replaceActors(docs);
  }
}

async function start() {
  await connectMongo();
  await hydrateFromMongoOrSeed();
  await seedDefaultUsers();
  startScraperService();

  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change'))) {
    console.warn('⚠️  WARNING: JWT_SECRET looks like the placeholder default. Set a real random secret in .env before going live — sessions can be forged otherwise.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🛡️  AEGISTRACE: THREAT ACTOR ATTRIBUTION ENGINE ONLINE`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️  MongoDB Atlas: ${mongoReady() ? 'CONNECTED' : 'NOT CONNECTED (in-memory only)'}`);
    console.log(`=======================================================`);
  });
}

start();
