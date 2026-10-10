import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, optionalAuth } from '../auth.js';

const router = Router();

// GET /api/stories
router.get('/', optionalAuth, async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = stories.map((s) => ({
      id: s.id,
      title: s.title,
      location: s.location,
      content: s.content,
      image: s.image,
      likes: s.likes,
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: s.author.name,
      authorAvatar: s.author.avatar,
    }));

    return res.json({ success: true, count: formatted.length, stories: formatted });
  } catch (err) {
    console.error('Fetch stories error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve stories.' });
  }
});

// POST /api/stories - Publish travel story
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, location, content, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const story = await prisma.story.create({
      data: {
        title: title.trim(),
        location: location?.trim() || 'Himalayas, India',
        content: content.trim(),
        image: image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        authorId: req.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        location: story.location,
        content: story.content,
        image: story.image,
        likes: story.likes,
        date: 'Just now',
        author: story.author.name,
        authorAvatar: story.author.avatar,
      },
      message: 'Travel story published!',
    });
  } catch (err) {
    console.error('Create story error:', err);
    return res.status(500).json({ success: false, error: 'Failed to publish story.' });
  }
});

// POST /api/stories/:id/like
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const story = await prisma.story.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
    return res.json({ success: true, likes: story.likes });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update like.' });
  }
});

export default router;
