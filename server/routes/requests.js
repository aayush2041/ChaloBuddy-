import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

// PUT /api/requests/:id/respond - Organizer accepts or declines a join request
router.put('/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'ACCEPT' | 'DECLINE' (or 'REJECT')

    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id },
      include: {
        Trip: {
          include: {
            TripMember: true,
          },
        },
        User: true,
      },
    });

    if (!tripRequest) {
      return res.status(404).json({ success: false, error: 'Request not found.' });
    }

    if (tripRequest.Trip.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the trip organizer can respond to join requests.',
      });
    }

    if (tripRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `This request has already been ${tripRequest.status.toLowerCase()}.`,
      });
    }

    const isAccepting = action === 'ACCEPT' || action === 'ACCEPTED';

    if (isAccepting) {
      // Execute seat allocation within a database transaction to prevent race conditions
      const result = await prisma.$transaction(async (tx) => {
        // 1. Fetch fresh trip capacity check
        const currentMembers = await tx.tripMember.findMany({
          where: { tripId: tripRequest.tripId },
        });

        const currentOccupancy = currentMembers.length + 1; // +1 host
        if (currentOccupancy >= tripRequest.Trip.groupSize) {
          throw new Error('CAPACITY_EXCEEDED');
        }

        // 2. Add traveler as official TripMember
        const member = await tx.tripMember.create({
          data: {
            id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            tripId: tripRequest.tripId,
            userId: tripRequest.requesterId,
          },
        });

        // 3. Update request status to ACCEPTED
        const updatedReq = await tx.tripRequest.update({
          where: { id },
          data: { status: 'ACCEPTED', updatedAt: new Date() },
        });

        // 4. Grant access to the trip's private group conversation
        const tripConv = await tx.conversation.findFirst({
          where: { tripId: tripRequest.tripId },
        });

        if (tripConv) {
          await tx.conversationParticipant.upsert({
            where: {
              conversationId_userId: {
                conversationId: tripConv.id,
                userId: tripRequest.requesterId,
              },
            },
            create: {
              conversationId: tripConv.id,
              userId: tripRequest.requesterId,
              role: 'MEMBER',
            },
            update: {},
          });
        }

        // 5. If capacity is now completely filled, update trip status to FULL
        if (currentOccupancy + 1 >= tripRequest.Trip.groupSize) {
          await tx.trip.update({
            where: { id: tripRequest.tripId },
            data: { status: 'FULL' },
          });
        }

        // 6. Notify traveler
        await tx.notification.create({
          data: {
            id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId: tripRequest.requesterId,
            type: 'JOIN_ACCEPTED',
            title: 'Trip Request Accepted! 🎒',
            body: `You are confirmed for "${tripRequest.Trip.title}". Group chat workspace is now unlocked!`,
          },
        });

        return { member, updatedReq };
      });

      return res.json({
        success: true,
        action: 'ACCEPTED',
        message: `${tripRequest.User.name} has been added to the trip!`,
        result,
      });
    } else {
      // Decline request
      const updatedReq = await prisma.tripRequest.update({
        where: { id },
        data: { status: 'DECLINED', updatedAt: new Date() },
      });

      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId: tripRequest.requesterId,
          type: 'JOIN_DECLINED',
          title: 'Trip Request Update',
          body: `The organizer was unable to accept your request for "${tripRequest.Trip.title}".`,
        },
      });

      return res.json({
        success: true,
        action: 'DECLINED',
        message: 'Request declined.',
        request: updatedReq,
      });
    }
  } catch (err) {
    if (err.message === 'CAPACITY_EXCEEDED') {
      return res.status(400).json({
        success: false,
        error: 'This trip is already at full capacity. No remaining seats are available.',
      });
    }
    console.error('Respond request error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process request.' });
  }
});

// DELETE /api/requests/:id - Traveler cancels their own pending join request
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.tripRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found.' });
    }

    if (request.requesterId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only cancel your own requests.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel a request that is already ${request.status.toLowerCase()}.`,
      });
    }

    await prisma.tripRequest.update({
      where: { id },
      data: { status: 'CANCELLED', updatedAt: new Date() },
    });

    return res.json({ success: true, message: 'Your join request was cancelled.' });
  } catch (err) {
    console.error('Cancel request error:', err);
    return res.status(500).json({ success: false, error: 'Failed to cancel request.' });
  }
});

// GET /api/requests/me - Get current user's join requests
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.tripRequest.findMany({
      where: { requesterId: req.user.id },
      include: {
        Trip: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            budgetMin: true,
            status: true,
            isWomenOnly: true,
            User: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    console.error('Fetch requests error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve your requests.' });
  }
});

export default router;
