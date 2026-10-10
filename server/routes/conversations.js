import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

// GET /api/conversations - List conversations for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userConvs = await prisma.conversationParticipant.findMany({
      where: { userId: req.user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true },
                },
              },
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
            trip: {
              select: { id: true, title: true, destination: true },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    const formatted = userConvs.map((cp) => {
      const c = cp.conversation;
      const otherParticipant = c.participants.find((p) => p.userId !== req.user.id)?.user;
      const lastMsg = c.messages[0];

      return {
        id: c.id,
        isGroup: c.isGroup,
        name: c.isGroup
          ? c.title || (c.trip ? `${c.trip.title} Room` : 'Group Expedition')
          : otherParticipant?.name || 'Traveler',
        avatar: c.isGroup
          ? 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=200&q=80'
          : otherParticipant?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        lastMessage: lastMsg ? `${lastMsg.sender.name}: ${lastMsg.content}` : 'No messages yet',
        lastTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        tripId: c.tripId,
        participantCount: c.participants.length,
      };
    });

    return res.json({ success: true, conversations: formatted });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve conversations.' });
  }
});

// GET /api/conversations/:id/messages - Get messages in a conversation
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify membership
    const isMember = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: req.user.id,
        },
      },
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view messages in this room.',
      });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      sender: m.sender.name,
      senderId: m.senderId,
      avatar: m.sender.avatar,
      text: m.content,
      image: m.imageUrl,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: m.senderId === req.user.id,
    }));

    return res.json({ success: true, count: formatted.length, messages: formatted });
  } catch (err) {
    console.error('Fetch messages error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve messages.' });
  }
});

// POST /api/conversations/:id/messages - Send a message
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, imageUrl } = req.body;

    if (!text?.trim() && !imageUrl) {
      return res.status(400).json({ success: false, error: 'Message content or image is required.' });
    }

    const isMember = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: req.user.id,
        },
      },
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to post messages in this room.',
      });
    }

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: id,
          senderId: req.user.id,
          content: text?.trim() || 'Sent an image attachment',
          imageUrl: imageUrl || null,
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Update conversation timestamp
      await tx.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    const formatted = {
      id: message.id,
      sender: message.sender.name,
      senderId: message.senderId,
      avatar: message.sender.avatar,
      text: message.content,
      image: message.imageUrl,
      time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    return res.status(201).json({ success: true, message: formatted });
  } catch (err) {
    console.error('Post message error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

// POST /api/conversations/direct - Get or create 1-on-1 direct conversation with another user
router.post('/direct', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId || recipientId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Valid recipient user ID is required.' });
    }

    // Check if direct conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: req.user.id } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
    });

    if (existing) {
      return res.json({ success: true, conversationId: existing.id });
    }

    // Create new direct conversation
    const newConv = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: req.user.id },
            { userId: recipientId },
          ],
        },
      },
    });

    return res.status(201).json({ success: true, conversationId: newConv.id });
  } catch (err) {
    console.error('Create direct conversation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to initialize conversation.' });
  }
});

export default router;
