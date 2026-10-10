import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

// GET /api/conversations - List conversations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        Trip: {
          select: { id: true, title: true, destination: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = conversations.map((c) => {
      const lastMsg = c.messages[0];
      return {
        id: c.id,
        name: c.title || (c.Trip ? `${c.Trip.title} Group` : 'Travel Chat'),
        avatar: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=200&q=80',
        lastMessage: lastMsg ? `${lastMsg.sender.name}: ${lastMsg.body}` : 'No messages yet',
        lastTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        tripId: c.tripId,
      };
    });

    return res.json({ success: true, count: formatted.length, conversations: formatted });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve conversations.' });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          include: { Profile: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      sender: m.sender.name,
      senderId: m.senderId,
      avatar: m.sender.Profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      text: m.body,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: m.senderId === req.user.id,
    }));

    return res.json({ success: true, count: formatted.length, messages: formatted });
  } catch (err) {
    console.error('Fetch messages error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve messages.' });
  }
});

// POST /api/conversations/:id/messages
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    const message = await prisma.message.create({
      data: {
        id: `msg_${Date.now()}`,
        conversationId: id,
        senderId: req.user.id,
        body: text.trim(),
      },
      include: {
        sender: {
          include: { Profile: true },
        },
      },
    });

    const formatted = {
      id: message.id,
      sender: message.sender.name,
      senderId: message.senderId,
      avatar: message.sender.Profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      text: message.body,
      time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    return res.status(201).json({ success: true, message: formatted });
  } catch (err) {
    console.error('Post message error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

// POST /api/conversations/direct - Direct Chat or Trip Room
router.post('/direct', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.body;

    let conv = await prisma.conversation.findFirst({
      where: { title: `Chat with ${recipientId}` },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          id: `conv_${Date.now()}`,
          title: `Chat with ${recipientId}`,
        },
      });
    }

    return res.json({ success: true, conversationId: conv.id });
  } catch (err) {
    console.error('Direct chat error:', err);
    return res.status(500).json({ success: false, error: 'Failed to open conversation.' });
  }
});

export default router;
