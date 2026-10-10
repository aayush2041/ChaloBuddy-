import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

// PUT /api/requests/:id/respond - Organiser accepts or rejects a join request
router.put('/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'ACCEPT' | 'REJECT' (maps to ACCEPTED / DECLINED)

    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id },
      include: {
        Trip: {
          include: { TripMember: true },
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
        error: 'Only the trip organizer can respond to this request.',
      });
    }

    if (tripRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `This request has already been ${tripRequest.status.toLowerCase()}.`,
      });
    }

    if (action === 'ACCEPT') {
      const remainingSpots = tripRequest.Trip.groupSize - (tripRequest.Trip.TripMember.length + 1);
      if (remainingSpots < 1) {
        return res.status(400).json({
          success: false,
          error: 'This trip is already at full capacity.',
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Add traveler to TripMember
        const member = await tx.tripMember.create({
          data: {
            id: `mem_${Date.now()}`,
            tripId: tripRequest.tripId,
            userId: tripRequest.requesterId,
          },
        });

        // 2. Mark request as ACCEPTED
        const updatedReq = await tx.tripRequest.update({
          where: { id },
          data: { status: 'ACCEPTED', updatedAt: new Date() },
        });

        // 3. Notify traveler
        await tx.notification.create({
          data: {
            id: `notif_${Date.now()}`,
            userId: tripRequest.requesterId,
            type: 'JOIN_ACCEPTED',
            title: 'Trip Request Accepted! 🎒',
            body: `You are officially confirmed for "${tripRequest.Trip.title}". Group workspace is active!`,
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
      const updatedReq = await prisma.tripRequest.update({
        where: { id },
        data: { status: 'DECLINED', updatedAt: new Date() },
      });

      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}`,
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
    console.error('Respond request error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process request.' });
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
