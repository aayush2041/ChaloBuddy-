import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const formatted = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      desc: n.description,
      unread: n.unread,
      time: new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      link: n.link ? { page: n.link.replace('#/', '').split('/')[0] } : null,
    }));

    return res.json({ success: true, count: formatted.length, notifications: formatted });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve notifications.' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id },
      data: { unread: false },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, unread: true },
      data: { unread: false },
    });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to mark notifications.' });
  }
});

export default router;
