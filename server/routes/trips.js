import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, optionalAuth } from '../auth.js';

const router = Router();

// GET /api/trips - Discover and search trips
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { destination, origin, date, travelers, vibe, maxPrice } = req.query;

    const where = {
      status: 'PUBLISHED',
    };

    if (destination && destination.trim()) {
      where.OR = [
        { destination: { contains: destination.trim(), mode: 'insensitive' } },
        { title: { contains: destination.trim(), mode: 'insensitive' } },
      ];
    }

    if (origin && origin.trim()) {
      where.startingLocation = { contains: origin.trim(), mode: 'insensitive' };
    }

    if (date) {
      where.startDate = { gte: new Date(date) };
    }

    if (travelers) {
      where.spotsLeft = { gte: Number(travelers) };
    }

    if (vibe) {
      where.vibes = { has: vibe };
    }

    if (maxPrice) {
      where.price = { lte: Number(maxPrice) };
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            tripsHosted: true,
            verified: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { startDate: 'asc' }],
    });

    const enriched = trips.map((t) => ({
      ...t,
      currentGroupSize: t.participants.reduce((sum, p) => sum + p.seatsBooked, 1),
      travelerAvatars: [
        t.organizer.avatar,
        ...t.participants.map((p) => p.user.avatar).filter(Boolean),
      ],
    }));

    return res.json({ success: true, count: enriched.length, trips: enriched });
  } catch (err) {
    console.error('List trips error:', err);
    return res.status(500).json({ success: false, error: 'Failed to search trips.' });
  }
});

// GET /api/trips/:id - Single trip details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            tripsHosted: true,
            tripsCompleted: true,
            verified: true,
            bio: true,
            location: true,
            languages: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        reviews: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    const enriched = {
      ...trip,
      currentGroupSize: trip.participants.reduce((sum, p) => sum + p.seatsBooked, 1),
      travelerAvatars: [
        trip.organizer.avatar,
        ...trip.participants.map((p) => p.user.avatar).filter(Boolean),
      ],
    };

    return res.json({ success: true, trip: enriched });
  } catch (err) {
    console.error('Get trip details error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve trip details.' });
  }
});

// POST /api/trips - List & Publish a Trip
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      startingLocation,
      destination,
      startDate,
      endDate,
      duration,
      departureTime,
      price,
      maxGroupSize,
      spotsLeft,
      about,
      meetingPoint,
      transport,
      stayDetails,
      included,
      excluded,
      images,
      vibes,
    } = req.body;

    if (!startingLocation || !destination || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Starting location, destination, and departure date are required.',
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000);

    const tripTitle =
      title?.trim() ||
      `${startingLocation.split(',')[0].trim()} to ${destination.split(',')[0].trim()} Group Journey`;

    // Create Trip + Associated Trip Room Conversation atomically
    const newTrip = await prisma.$transaction(async (tx) => {
      // 1. Create group conversation for trip
      const conversation = await tx.conversation.create({
        data: {
          title: `${tripTitle} • Official Trip Room`,
          isGroup: true,
          participants: {
            create: {
              userId: req.user.id,
            },
          },
        },
      });

      // 2. Create Trip
      const trip = await tx.trip.create({
        data: {
          title: tripTitle,
          subtitle: subtitle || `Group expedition departing ${departureTime || 'morning'}.`,
          startingLocation: startingLocation.trim(),
          destination: destination.trim(),
          startDate: start,
          endDate: end,
          duration: duration || '4 Days / 3 Nights',
          price: Number(price) || 0,
          maxGroupSize: Number(maxGroupSize) || 8,
          spotsLeft: Number(spotsLeft !== undefined ? spotsLeft : Number(maxGroupSize || 8) - 1),
          about: about || `Join our group journey from ${startingLocation} to ${destination}.`,
          meetingPoint: meetingPoint || `${startingLocation} (${departureTime || '06:00 AM'})`,
          transport: transport || 'Private Group Coach',
          stayDetails: stayDetails || 'Curated Boutique Homestay',
          included: Array.isArray(included) ? included : ['Group Transit', 'Guided Hikes', 'Local Breakfast'],
          excluded: Array.isArray(excluded) ? excluded : ['Personal Expenses', 'Adventure Insurance'],
          images: Array.isArray(images) && images.length ? images : [
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
          ],
          vibes: Array.isArray(vibes) ? vibes : ['Mountains', 'Adventure'],
          organizerId: req.user.id,
          conversationId: conversation.id,
        },
      });

      // 3. Increment host's tripsHosted counter
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          tripsHosted: { increment: 1 },
          role: 'ORGANIZER',
        },
      });

      return trip;
    });

    return res.status(201).json({
      success: true,
      trip: newTrip,
      message: 'Trip published successfully!',
    });
  } catch (err) {
    console.error('Publish trip error:', err);
    return res.status(500).json({ success: false, error: 'Failed to publish trip.' });
  }
});

// POST /api/trips/:id/join-requests - Submit a Join Request (Pending Approval)
router.post('/:id/join-requests', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { travelersCount, message, emergencyContact, specialRequests } = req.body;

    const count = Math.max(1, Number(travelersCount) || 1);

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { organizer: true },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.organizerId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You are the organizer of this trip.' });
    }

    if (trip.spotsLeft < count) {
      return res.status(400).json({
        success: false,
        error: `Only ${trip.spotsLeft} spot(s) remaining on this trip.`,
      });
    }

    // Check for existing request
    const existing = await prisma.joinRequest.findUnique({
      where: {
        tripId_travelerId: {
          tripId: id,
          travelerId: req.user.id,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `You already have a request (${existing.status.toLowerCase()}) for this trip.`,
      });
    }

    const totalAmount = Number(trip.price) * count;

    // Create JoinRequest + Notification for organizer atomically
    const request = await prisma.$transaction(async (tx) => {
      const created = await tx.joinRequest.create({
        data: {
          tripId: id,
          travelerId: req.user.id,
          travelersCount: count,
          totalAmount,
          message: message?.trim() || null,
          emergencyContact: emergencyContact?.trim() || null,
          specialRequests: specialRequests?.trim() || null,
          status: 'PENDING',
        },
      });

      // Notify the organizer
      await tx.notification.create({
        data: {
          userId: trip.organizerId,
          title: 'New Trip Join Request! 🎒',
          description: `${req.user.name} requested to join "${trip.title}" (${count} traveler${count > 1 ? 's' : ''}).`,
          link: `#/my-trips/upcoming`,
        },
      });

      return created;
    });

    return res.status(201).json({
      success: true,
      request,
      message: 'Join request sent to the organizer! You will be notified when accepted.',
    });
  } catch (err) {
    console.error('Submit join request error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit join request.' });
  }
});

// GET /api/trips/:id/join-requests - Host views pending requests for their trip
router.get('/:id/join-requests', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the organizer can view join requests for this trip.',
      });
    }

    const requests = await prisma.joinRequest.findMany({
      where: { tripId: id },
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            rating: true,
            verified: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    console.error('Fetch requests error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve join requests.' });
  }
});

// PUT /api/trips/:id - Edit a trip (Organizer only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found.' });
    if (trip.organizerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You are not authorized to edit this trip.' });
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: req.body,
    });

    return res.json({ success: true, trip: updated, message: 'Trip updated successfully.' });
  } catch (err) {
    console.error('Edit trip error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update trip.' });
  }
});

// DELETE /api/trips/:id - Cancel a trip (Organizer only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found.' });
    if (trip.organizerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You are not authorized to cancel this trip.' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark trip as CANCELLED
      await tx.trip.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // 2. Notify all participants
      for (const p of trip.participants) {
        await tx.notification.create({
          data: {
            userId: p.userId,
            title: 'Trip Cancelled by Host ⚠️',
            description: `"${trip.title}" has been cancelled by the host.`,
            link: `#/my-trips`,
          },
        });
      }
    });

    return res.json({ success: true, message: 'Trip cancelled and participants notified.' });
  } catch (err) {
    console.error('Cancel trip error:', err);
    return res.status(500).json({ success: false, error: 'Failed to cancel trip.' });
  }
});

export default router;
