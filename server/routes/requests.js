import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

// PUT /api/requests/:id/respond - Organiser accepts or rejects a join request
router.put('/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // 'ACCEPT' | 'REJECT'

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be ACCEPT or REJECT.' });
    }

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            conversation: true,
          },
        },
        traveler: true,
      },
    });

    if (!joinRequest) {
      return res.status(404).json({ success: false, error: 'Join request not found.' });
    }

    // Verify current user is the organizer of the trip
    if (joinRequest.trip.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the trip organizer can respond to this request.',
      });
    }

    if (joinRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `This request has already been ${joinRequest.status.toLowerCase()}.`,
      });
    }

    if (action === 'ACCEPT') {
      // ATOMIC TRANSACTION: Decrement seats, add participant, join trip conversation
      const result = await prisma.$transaction(async (tx) => {
        // 1. Double-check available spots inside transaction
        const currentTrip = await tx.trip.findUnique({
          where: { id: joinRequest.tripId },
        });

        if (currentTrip.spotsLeft < joinRequest.travelersCount) {
          throw new Error(`Insufficient spots remaining (only ${currentTrip.spotsLeft} left).`);
        }

        // 2. Decrement spotsLeft
        const updatedTrip = await tx.trip.update({
          where: { id: joinRequest.tripId },
          data: {
            spotsLeft: { decrement: joinRequest.travelersCount },
          },
        });

        // 3. Create TripParticipant record
        const participant = await tx.tripParticipant.create({
          data: {
            tripId: joinRequest.tripId,
            userId: joinRequest.travelerId,
            seatsBooked: joinRequest.travelersCount,
          },
        });

        // 4. Add traveler to the Trip Room Conversation
        if (joinRequest.trip.conversationId) {
          await tx.conversationParticipant.upsert({
            where: {
              conversationId_userId: {
                conversationId: joinRequest.trip.conversationId,
                userId: joinRequest.travelerId,
              },
            },
            create: {
              conversationId: joinRequest.trip.conversationId,
              userId: joinRequest.travelerId,
            },
            update: {},
          });

          // Post a system welcome message
          await tx.message.create({
            data: {
              conversationId: joinRequest.trip.conversationId,
              senderId: req.user.id,
              content: `🎉 ${joinRequest.traveler.name} joined the expedition! Welcome to the group!`,
            },
          });
        }

        // 5. Update request status
        const updatedRequest = await tx.joinRequest.update({
          where: { id },
          data: { status: 'ACCEPTED' },
        });

        // 6. Notify the traveler
        await tx.notification.create({
          data: {
            userId: joinRequest.travelerId,
            title: 'Trip Request Accepted! 🎒',
            desc: `Your request to join "${joinRequest.trip.title}" was accepted! You are now in the Trip Room.`,
            link: `#/my-trips/upcoming`,
          },
        });

        return { updatedTrip, updatedRequest, participant };
      });

      return res.json({
        success: true,
        action: 'ACCEPTED',
        message: `${joinRequest.traveler.name} has been added to the trip!`,
        result,
      });
    } else {
      // REJECT action
      const updatedRequest = await prisma.$transaction(async (tx) => {
        const reqUpdated = await tx.joinRequest.update({
          where: { id },
          data: { status: 'REJECTED' },
        });

        await tx.notification.create({
          data: {
            userId: joinRequest.travelerId,
            title: 'Trip Request Update',
            desc: `The host was unable to accept your request for "${joinRequest.trip.title}"${reason ? `: ${reason}` : '.'}`,
            link: `#/trips`,
          },
        });

        return reqUpdated;
      });

      return res.json({
        success: true,
        action: 'REJECTED',
        message: `Request from ${joinRequest.traveler.name} has been declined.`,
        request: updatedRequest,
      });
    }
  } catch (err) {
    console.error('Respond to request error:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to process request response.',
    });
  }
});

// GET /api/requests/me - Get current user's join requests
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.joinRequest.findMany({
      where: { travelerId: req.user.id },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            price: true,
            images: true,
            status: true,
            organizer: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    console.error('Fetch user requests error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve your join requests.' });
  }
});

export default router;
