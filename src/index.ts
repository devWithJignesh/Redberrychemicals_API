import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, isConnected } from './config/db';
import { loggerMiddleware } from './middlewares/loggerMiddleware';
import { errorMiddleware } from './middlewares/errorMiddleware';
import apiRoutes from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/redberry_db';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(loggerMiddleware);

// Serve static assets folder (assets/subproduct etc.) and legacy uploads folder
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api', apiRoutes);

// Health Check API
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    server: 'Running',
    database: isConnected ? 'CONNECTED' : 'DISCONNECTED',
    mongoURI: MONGO_URI,
    timestamp: new Date().toISOString(),
  });
});

// Server Status Web Page Root
app.get('/', (req: Request, res: Response) => {
  const dbStatusClass = isConnected ? 'status-online' : 'status-offline';
  const dbStatusText = isConnected
    ? 'MongoDB Connected Successfully'
    : 'MongoDB Connecting / Disconnected';
  const dbBadge = isConnected ? 'ONLINE 🟢' : 'CONNECTING 🟡';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redberry Backend Server Status</title>
      <style>
        :root {
          --bg-color: #0b1320;
          --card-bg: #111c2e;
          --primary: #10b981;
          --text-main: #f8fafc;
          --text-sub: #94a3b8;
          --border: #1e2d42;
          --danger: #ef4444;
          --warning: #f59e0b;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--bg-color);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .status-container {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2.5rem;
          max-width: 650px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .logo-box {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0f5132 0%, #10b981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .title-area h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
        }

        .title-area p {
          font-size: 0.88rem;
          color: var(--text-sub);
          margin-top: 0.2rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .status-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-sub);
          font-weight: 700;
        }

        .value {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }

        .badge {
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.03em;
        }

        .status-online {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.3);
        }

        .status-offline {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .endpoint-list {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 1.25rem;
          border: 1px solid var(--border);
        }

        .endpoint-list h3 {
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
          color: var(--text-sub);
        }

        .endpoint-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
          font-family: monospace;
          font-size: 0.9rem;
        }

        .endpoint-item:last-child {
          border-bottom: none;
        }

        .method {
          color: #60a5fa;
          font-weight: bold;
        }

        .path {
          color: #ffffff;
        }

        .footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-sub);
        }
      </style>
    </head>
    <body>
      <div class="status-container">
        <div class="header">
          <div class="logo-box">🌱</div>
          <div class="title-area">
            <h1>Redberry Backend API Server</h1>
            <p>Node.js • Express • TypeScript • MongoDB Engine</p>
          </div>
        </div>

        <div class="status-grid">
          <!-- Server Status -->
          <div class="status-box">
            <div class="status-info">
              <span class="label">Server Status</span>
              <span class="value">Server is Running Smoothly</span>
              <span style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">Port: ${PORT}</span>
            </div>
            <span class="badge status-online">RUNNING 🟢</span>
          </div>

          <!-- MongoDB Status -->
          <div class="status-box">
            <div class="status-info">
              <span class="label">Database Connection</span>
              <span class="value">${dbStatusText}</span>
              <span style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">${MONGO_URI}</span>
            </div>
            <span class="badge ${dbStatusClass}">${dbBadge}</span>
          </div>
        </div>

        <div class="footer">
          Redberry Agri Sciences • Local Node.js Development Server
        </div>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use(errorMiddleware);

import { seedDatabase } from './helpers/seedDatabase';

// Start Server & Connect MongoDB
const startServer = async () => {
  const dbConnected = await connectDB();
  if (dbConnected) {
    // await seedDatabase();
  }
  app.listen(PORT, () => {
    console.log(`\x1b[36m🚀 Redberry Backend Server is Running on:\x1b[0m http://localhost:${PORT}`);
  });
};

startServer();
