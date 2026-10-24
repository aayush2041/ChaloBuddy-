import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../auth.js';
import { evaluateMessage } from '../services/contactFilter.js';

const router = Router();

// Helper to check user's authorization to a conversation
async function checkConversationAccess(conversationId, user) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      Trip: {
        include: {
          TripMember: true,
          User: true,
        },
      },
      participants: true,
    },
  });

  if (!conversation) {
    return { authorized: false, reason: 'Conversation not found', conversation: null };
  }

  // 1. Direct participant check
  const isParticipant = conversation.participants.some((p) => p.userId === user.id);

  // 2. Trip host or confirmed member check
  let isTripMember = false;
  if (conversation.Trip) {
    if (conversation.Trip.creatorId === user.id) {
      isTripMember = true;
    } else if (conversation.Trip.TripMember.some((m) => m.userId === user.id)) {
      isTripMember = true;
    }

    // Women-only access restriction:
    if (conversation.Trip.isWomenOnly) {
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id },
        select: { gender: true },
      });
      if (userRecord?.gender !== 'FEMALE') {
        return {
          authorized: false,
          reason: 'Access restricted: This group chat is exclusively reserved for verified female travelers.',
          conversation,
        };
      }
    }
  }

  if (isParticipant || isTripMember) {
    // Auto-register membership in ConversationParticipant if missing
    if (!isParticipant) {
      await prisma.conversationParticipant.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId: user.id,
          },
        },
        create: {
          conversationId,
          userId: user.id,
          role: conversation.Trip?.creatorId === user.id ? 'HOST' : 'MEMBER',
        },
        update: {},
      });
    }
    return { authorized: true, conversation };
  }

  return {
    authorized: false,
    reason: 'You do not have permission to view or participate in this conversation.',
    conversation,
  };
}

// GET /api/conversations - List user's authorized conversations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user record to check gender for women-only query enforcement
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { gender: true },
    });

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participants: { some: { userId } } },
          { Trip: { creatorId: userId } },
          { Trip: { TripMember: { some: { userId } } } },
        ],
      },
      include: {
        Trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            isWomenOnly: true,
            coverImage: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                Profile: { select: { avatarUrl: true } },
              },
            },
          },
        },
        messages: {
          where: { moderationStatus: 'APPROVED' },
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

    // Filter out women-only rooms if current user is not FEMALE
    const filtered = conversations.filter((c) => {
      if (c.Trip?.isWomenOnly && currentUser?.gender !== 'FEMALE') {
        return false;
      }
      return true;
    });

    const formatted = filtered.map((c) => {
      const lastMsg = c.messages[0];
      const otherParticipant = c.participants.find((p) => p.userId !== userId);

      return {
        id: c.id,
        name: c.title || (c.Trip ? `${c.Trip.title} Group` : otherParticipant?.user?.name || 'Travel Conversation'),
        avatar: c.Trip?.coverImage || otherParticipant?.user?.Profile?.avatarUrl || 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=200&q=80',
        lastMessage: lastMsg ? `${lastMsg.sender.name}: ${lastMsg.body}` : 'No messages yet',
        lastTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
        tripId: c.tripId,
        isWomenOnly: Boolean(c.Trip?.isWomenOnly),
      };
    });

    return res.json({ success: true, count: formatted.length, conversations: formatted });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve conversations.' });
  }
});

// GET /api/conversations/:id/messages - Authorized Message Retrieval
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const access = await checkConversationAccess(id, req.user);
    if (!access.authorized) {
      return res.status(403).json({ success: false, error: access.reason });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
        moderationStatus: 'APPROVED',
      },
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

// POST /api/conversations/:id/messages - Authorized & Moderated Message Send
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: 'Message content cannot be empty.' });
    }

    // 1. Authorization check
    const access = await checkConversationAccess(id, req.user);
    if (!access.authorized) {
      return res.status(403).json({ success: false, error: access.reason });
    }

    // 2. Personal Contact Information Protection Filter
    const filterResult = evaluateMessage(text);

    if (!filterResult.isAllowed) {
      // Log security violation for trust & safety audit
      console.warn(`[Security Alert] Contact violation from user ${req.user.id}: ${filterResult.violationType}`);

      return res.status(400).json({
        success: false,
        blocked: true,
        violationType: filterResult.violationType,
        error: filterResult.reason,
      });
    }

    // 3. Persist validated message
    const message = await prisma.message.create({
      data: {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        conversationId: id,
        senderId: req.user.id,
        body: text.trim(),
        moderationStatus: 'APPROVED',
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

// POST /api/conversations/direct - Start or Retrieve 1:1 Direct Chat
router.post('/direct', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    if (!recipientId || recipientId === userId) {
      return res.status(400).json({ success: false, error: 'A valid distinct recipient is required.' });
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      include: { Profile: true },
    });

    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient user does not exist.' });
    }

    // Find existing direct conversation between these two users
    let conv = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          title: `Direct Chat with ${recipient.name}`,
          type: 'DIRECT',
          participants: {
            create: [
              { userId, role: 'MEMBER' },
              { userId: recipientId, role: 'MEMBER' },
            ],
          },
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
