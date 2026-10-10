import { Router } from 'express';
import { INITIAL_STORIES } from '../../client/src/data/seedData.js';
import { authenticateToken, optionalAuth } from '../auth.js';

const router = Router();
let runtimeStories = [...INITIAL_STORIES];

// GET /api/stories
router.get('/', optionalAuth, (req, res) => {
  return res.json({ success: true, count: runtimeStories.length, stories: runtimeStories });
});

// POST /api/stories
router.post('/', authenticateToken, (req, res) => {
  const { title, location, content, image } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Title and content are required.' });
  }

  const newStory = {
    id: `story-${Date.now()}`,
    title: title.trim(),
    location: location?.trim() || 'Himalayas, India',
    content: content.trim(),
    image: image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    likes: 1,
    date: 'Just now',
    author: req.user.name || 'Traveler',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  };

  runtimeStories.unshift(newStory);
  return res.status(201).json({ success: true, story: newStory, message: 'Story published!' });
});

// POST /api/stories/:id/like
router.post('/:id/like', authenticateToken, (req, res) => {
  const { id } = req.params;
  const target = runtimeStories.find((s) => s.id === id);
  if (target) {
    target.likes = (target.likes || 0) + 1;
    return res.json({ success: true, likes: target.likes });
  }
  return res.json({ success: true, likes: 1 });
});

export default router;
