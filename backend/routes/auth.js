import express from 'express';
import User from '../models/User.js';
import { hashPassword, comparePassword, signToken } from '../utils/auth.js';
import { mongoReady } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Ensures a default admin and a default investigator account exist.
 * Called once at server startup (after Mongo connects). Credentials come
 * from .env so they can be changed without touching code. Safe to call
 * repeatedly — it only creates what's missing.
 */
export async function seedDefaultUsers() {
  if (!mongoReady()) return;

  const defaults = [
    {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'ChangeMe_Admin123',
      role: 'admin',
      displayName: 'Dataset Administrator',
    },
    {
      username: process.env.INVESTIGATOR_USERNAME || 'investigator',
      password: process.env.INVESTIGATOR_PASSWORD || 'ChangeMe_Investigator123',
      role: 'investigator',
      displayName: 'Threat Investigator',
    },
  ];

  for (const d of defaults) {
    const existing = await User.findOne({ username: d.username });
    if (!existing) {
      const passwordHash = await hashPassword(d.password);
      await User.create({
        username: d.username,
        passwordHash,
        role: d.role,
        displayName: d.displayName,
      });
      console.log(`👤 Seeded default ${d.role} account: ${d.username} / ${d.password} (change via .env)`);
    }
  }
}

function handleLogin(expectedRole) {
  return async (req, res) => {
    try {
      if (!mongoReady()) {
        return res.status(503).json({
          success: false,
          error: 'Login requires MongoDB Atlas to be connected. Set MONGODB_URI in backend/.env and restart the server.',
        });
      }

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required.' });
      }

      const user = await User.findOne({ username: username.trim() });
      if (!user || (expectedRole && user.role !== expectedRole)) {
        return res.status(401).json({ success: false, error: 'Invalid credentials for this login.' });
      }

      const ok = await comparePassword(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
      }

      const token = signToken(user);
      res.json({
        success: true,
        token,
        user: { username: user.username, role: user.role, displayName: user.displayName },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

// POST /api/auth/login/admin
router.post('/login/admin', handleLogin('admin'));

// POST /api/auth/login/investigator
router.post('/login/investigator', handleLogin('investigator'));

// GET /api/auth/me - verify current session / hydrate frontend on refresh
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
