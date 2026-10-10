import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chalobuddy_super_secure_production_secret_key_2026_xyz';
const TOKEN_EXPIRY = '7d';

export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authenticateToken(req, res, next) {
  let token = null;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check Cookie
  if (!token && req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split(';').map((c) => {
        const [k, v] = c.trim().split('=');
        return [k, decodeURIComponent(v || '')];
      })
    );
    token = cookies.cb_token || null;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to continue.',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
    });
  }

  req.user = decoded;
  next();
}

export function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split(';').map((c) => {
        const [k, v] = c.trim().split('=');
        return [k, decodeURIComponent(v || '')];
      })
    );
    token = cookies.cb_token || null;
  }

  if (token) {
    req.user = verifyToken(token);
  }
  next();
}
