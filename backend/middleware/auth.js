import { verifyToken } from '../utils/auth.js';

/**
 * Requires a valid Bearer JWT. Attaches { id, username, role } to req.user.
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, username: payload.username, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
  }
}

/**
 * Restricts a route to one or more roles. Use after `authenticate`.
 * requireRole('admin') or requireRole('admin', 'investigator')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Forbidden: requires role ${roles.join(' or ')}.` });
    }
    return next();
  };
}
