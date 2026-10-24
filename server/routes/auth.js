import { Router } from 'express';
import prisma from '../db.js';
import { hashPassword, verifyPassword, generateToken, authenticateToken, optionalAuth } from '../auth.js';

const router = Router();

// Calculate profile completeness score (0-100%)
function calculateCompleteness(user) {
  let score = 0;
  if (user.name) score += 15;
  if (user.email) score += 15;
  if (user.Profile?.avatarUrl && !user.Profile.avatarUrl.includes('placeholder')) score += 15;
  if (user.Profile?.bio && user.Profile.bio.length > 20) score += 20;
  if (user.Profile?.city) score += 10;
  if (user.Profile?.languages) score += 10;
  if (user.Profile?.interests) score += 10;
  if (user.isVerified || user.Verification?.verified) score += 5;
  return Math.min(100, score);
}

// Helper to format safe private user object (for the logged in user)
function formatSafeUser(user) {
  const completeness = calculateCompleteness(user);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    gender: user.gender || user.Profile?.gender || 'PREFER_NOT_TO_SAY',
    avatar: user.Profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: user.Profile?.bio || '',
    location: user.Profile?.city || 'India',
    rating: user.Profile?.companionRating || 5.0,
    tripsCompleted: user.Profile?.tripsCompleted || 0,
    verified: Boolean(user.isVerified || user.Verification?.verified),
    role: user.role?.toLowerCase() || 'traveler',
    languages: user.Profile?.languages || 'English, Hindi',
    interests: user.Profile?.interests || 'Trekking, Cafes, Photography',
    travelStyle: user.Profile?.travelStyle || 'ADVENTURE',
    budgetMin: user.Profile?.budgetMin || 4000,
    budgetMax: user.Profile?.budgetMax || 25000,
    completeness,
  };
}

// Helper to format safe public profile (never exposes email, phone, or private documents)
function formatPublicProfile(user) {
  return {
    id: user.id,
    name: user.name,
    gender: user.gender || user.Profile?.gender || 'PREFER_NOT_TO_SAY',
    avatar: user.Profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: user.Profile?.bio || '',
    location: user.Profile?.city || 'India',
    rating: user.Profile?.companionRating || 5.0,
    tripsCompleted: user.Profile?.tripsCompleted || 0,
    verified: Boolean(user.isVerified || user.Verification?.verified),
    languages: user.Profile?.languages || 'English, Hindi',
    interests: user.Profile?.interests || 'Trekking, Sightseeing',
    travelStyle: user.Profile?.travelStyle || 'ADVENTURE',
    completeness: calculateCompleteness(user),
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

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
    const cleanGender = ['FEMALE', 'MALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(gender?.toUpperCase())
      ? gender.toUpperCase()
      : 'PREFER_NOT_TO_SAY';

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
        gender: cleanGender,
        role: 'TRAVELER',
        isVerified: cleanGender === 'FEMALE', // Auto-verify female demo accounts for streamlined testing
        Profile: {
          create: {
            id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            avatarUrl: cleanGender === 'FEMALE'
              ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            bio: 'Excited to discover mountain trails and new travel buddies with ChaloBuddy.',
            city: 'India',
            gender: cleanGender,
            companionRating: 5.0,
            languages: 'English, Hindi',
            interests: 'Trekking, Road Trips, Photography',
            budgetMin: 4000,
            budgetMax: 20000,
          },
        },
        Verification: {
          create: {
            id: `verif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            verified: true,
            verifiedAt: new Date(),
          },
        },
      },
      include: {
        Profile: true,
        Verification: true,
      },
    });

    const token = generateToken(user);

    res.cookie('cb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token,
      user: formatSafeUser(user),
      message: 'Account created successfully! Welcome to ChaloBuddy.',
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

// GET /api/auth/user/:id - Public traveler profile
router.get('/user/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        Profile: true,
        Verification: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Traveler not found.' });
    }

    return res.json({ success: true, traveler: formatPublicProfile(user) });
  } catch (err) {
    console.error('Get public profile error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch traveler profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      avatar,
      gender,
      languages,
      interests,
      travelStyle,
      budgetMin,
      budgetMax,
    } = req.body;

    const userUpdates = {};
    if (name) userUpdates.name = name.trim();
    if (gender && ['FEMALE', 'MALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(gender.toUpperCase())) {
      userUpdates.gender = gender.toUpperCase();
    }

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: userUpdates,
      });
    }

    const profileUpdates = {};
    if (bio !== undefined) profileUpdates.bio = bio.trim();
    if (location !== undefined) profileUpdates.city = location.trim();
    if (avatar) profileUpdates.avatarUrl = avatar;
    if (gender) profileUpdates.gender = gender.toUpperCase();
    if (languages) profileUpdates.languages = languages;
    if (interests) profileUpdates.interests = interests;
    if (travelStyle) profileUpdates.travelStyle = travelStyle.toUpperCase();
    if (budgetMin !== undefined) profileUpdates.budgetMin = Number(budgetMin);
    if (budgetMax !== undefined) profileUpdates.budgetMax = Number(budgetMax);

    await prisma.profile.upsert({
      where: { userId: req.user.id },
      create: {
        id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: req.user.id,
        avatarUrl: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: bio || '',
        city: location || 'India',
        gender: gender || 'PREFER_NOT_TO_SAY',
        languages: languages || 'English, Hindi',
        interests: interests || 'Trekking, Road Trips',
        travelStyle: travelStyle || 'ADVENTURE',
        budgetMin: Number(budgetMin) || 4000,
        budgetMax: Number(budgetMax) || 25000,
      },
      update: profileUpdates,
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { Profile: true, Verification: true },
    });

    return res.json({
      success: true,
      user: formatSafeUser(updatedUser),
      message: 'Traveler profile updated successfully.',
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('cb_token');
  return res.json({ success: true, message: 'Signed out successfully.' });
});

export default router;
