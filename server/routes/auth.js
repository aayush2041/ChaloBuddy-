import { Router } from 'express';
import prisma from '../db.js';
import { hashPassword, verifyPassword, generateToken, authenticateToken } from '../auth.js';

const router = Router();

// Helper to format safe user object with Profile & Verification
function formatSafeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.Profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: user.Profile?.bio || '',
    location: user.Profile?.city || 'India',
    rating: user.Profile?.companionRating || 5.0,
    tripsCompleted: user.Profile?.tripsCompleted || 0,
    verified: Boolean(user.Verification?.verified),
    role: 'traveler',
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
        Profile: {
          create: {
            id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            bio: 'Ready to explore mountain trails and scenic views.',
            city: 'India',
            companionRating: 5.0,
          },
        },
        Verification: {
          create: {
            id: `verif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            verified: true,
          },
        },
      },
      include: {
        Profile: true,
        Verification: true,
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

    return res.status(201).json({
      success: true,
      token,
      user: formatSafeUser(user),
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
      include: {
        Profile: true,
        Verification: true,
      },
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

    return res.json({
      success: true,
      token,
      user: formatSafeUser(user),
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
      include: {
        Profile: true,
        Verification: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    return res.json({ success: true, user: formatSafeUser(user) });
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
    const { name, bio, location, avatar } = req.body;

    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: name.trim() },
      });
    }

    if (bio !== undefined || location !== undefined || avatar) {
      await prisma.profile.upsert({
        where: { userId: req.user.id },
        create: {
          id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: req.user.id,
          bio: bio || '',
          city: location || '',
          avatarUrl: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        update: {
          ...(bio !== undefined && { bio }),
          ...(location !== undefined && { city: location }),
          ...(avatar && { avatarUrl: avatar }),
        },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { Profile: true, Verification: true },
    });

    return res.json({ success: true, user: formatSafeUser(updatedUser), message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

export default router;
