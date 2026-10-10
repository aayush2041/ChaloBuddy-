import { Router } from 'express';
import prisma from '../db.js';
import { hashPassword, verifyPassword, generateToken, authenticateToken } from '../auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone?.trim() || null,
        role: role === 'ORGANIZER' ? 'ORGANIZER' : 'TRAVELER',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        bio: 'Ready to explore mountain trails and scenic views.',
        location: 'India',
        travelStyle: ['Adventure', 'Backpacking'],
        interests: ['Trekking', 'Campfires'],
        languages: ['English', 'Hindi'],
      },
    });

    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie('cb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.status(201).json({
      success: true,
      token,
      user: safeUser,
      message: 'Account created successfully!',
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      error: 'We could not complete your registration right now. Please try again.',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.cookie('cb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      success: true,
      token,
      user: safeUser,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Login failed due to a server error. Please try again.',
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        verified: true,
        phone: true,
        bio: true,
        location: true,
        travelStyle: true,
        interests: true,
        languages: true,
        rating: true,
        tripsHosted: true,
        tripsCompleted: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve user profile.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('cb_token');
  return res.json({ success: true, message: 'Signed out successfully.' });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, location, travelStyle, interests, languages, phone, avatar } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(phone !== undefined && { phone }),
        ...(avatar && { avatar }),
        ...(Array.isArray(travelStyle) && { travelStyle }),
        ...(Array.isArray(interests) && { interests }),
        ...(Array.isArray(languages) && { languages }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        verified: true,
        phone: true,
        bio: true,
        location: true,
        travelStyle: true,
        interests: true,
        languages: true,
        rating: true,
        tripsHosted: true,
        tripsCompleted: true,
      },
    });

    return res.json({ success: true, user: updated, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

export default router;
