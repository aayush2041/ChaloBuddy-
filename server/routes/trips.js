import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, optionalAuth } from '../auth.js';

const router = Router();

function formatTripForClient(t) {
  const members = t.TripMember || [];
  const organizer = t.User;
  const organizerProfile = organizer?.Profile;
  const memberCount = members.length + 1;
  const spotsLeft = Math.max(0, t.groupSize - memberCount);

  return {
    id: t.id,
    title: t.title,
    subtitle: t.description ? t.description.slice(0, 100) : '',
    startingLocation: t.startingCity || 'Delhi, India',
    destination: t.destination,
    destinationLat: t.destinationLat,
    destinationLng: t.destinationLng,
    startDate: t.startDate ? t.startDate.toISOString().split('T')[0] : '',
    endDate: t.endDate ? t.endDate.toISOString().split('T')[0] : '',
    dates: t.startDate && t.endDate
      ? `${new Date(t.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${new Date(t.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'Upcoming',
    duration: t.startDate && t.endDate
      ? `${Math.max(1, Math.round((new Date(t.endDate) - new Date(t.startDate)) / 86400000))} Days`
      : '4 Days',
    price: t.budgetMin || t.budgetMax || 4500,
    maxGroupSize: t.groupSize,
    currentGroupSize: memberCount,
    spotsLeft: spotsLeft,
    difficulty: t.intensity === 'HIGH' ? 'Challenging' : t.intensity === 'EASY' ? 'Easy' : 'Moderate',
    meetingPoint: `${t.startingCity || 'Delhi'} Assembly Point`,
    transport: t.transport === 'BUS' ? 'AC Volvo Coach' : t.transport === 'TRAIN' ? 'Express Train' : t.transport === 'FLIGHT' ? 'Flight' : 'Private Road Vehicle',
    stayDetails: t.accommodation === 'HOMESTAY' ? 'Verified Heritage Homestay' : 'Curated Boutique Stay',
    about: t.description,
    included: t.included ? t.included.split(', ') : ['Group Transit', 'Guided Hikes', 'Local Meals'],
    excluded: t.excluded ? t.excluded.split(', ') : ['Personal Expenses', 'Personal Gear'],
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    ],
    vibes: [t.travelStyle ? t.travelStyle.toLowerCase() : 'adventure', 'mountains'],
    featured: true,
    rating: 4.9,
    reviewCount: t.reviews ? t.reviews.length : 0,
    organizer: {
      id: organizer?.id || 'usr_aarav',
      name: organizer?.name || 'Aarav Sharma',
      avatar: organizerProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rating: organizerProfile?.companionRating || 4.9,
      tripsHosted: organizerProfile?.tripsCompleted || 10,
      verified: true,
      bio: organizerProfile?.bio || '',
    },
    travelerAvatars: [
      organizerProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      ...members.map((m) => m.User?.Profile?.avatarUrl).filter(Boolean),
    ],
  };
}

// GET /api/trips - List & Search Trips from Neon
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { destination, origin, date, maxPrice } = req.query;

    const where = {
      status: { in: ['PUBLISHED', 'GROUP_FORMING'] },
    };

    if (destination && destination.trim()) {
      where.destination = { contains: destination.trim(), mode: 'insensitive' };
    }

    if (origin && origin.trim()) {
      where.startingCity = { contains: origin.trim(), mode: 'insensitive' };
    }

    if (date) {
      where.startDate = { gte: new Date(date) };
    }

    if (maxPrice) {
      where.budgetMin = { lte: Number(maxPrice) };
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        User: {
          include: { Profile: true },
        },
        TripMember: {
          include: {
            User: {
              include: { Profile: true },
            },
          },
        },
        reviews: true,
      },
      orderBy: { startDate: 'asc' },
    });

    const formatted = trips.map(formatTripForClient);
    return res.json({ success: true, count: formatted.length, trips: formatted });
  } catch (err) {
    console.error('List trips error:', err);
    return res.status(500).json({ success: false, error: 'Failed to search trips.' });
  }
});

// GET /api/trips/:id - Single Trip
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        User: {
          include: { Profile: true },
        },
        TripMember: {
          include: {
            User: {
              include: { Profile: true },
            },
          },
        },
        reviews: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    return res.json({ success: true, trip: formatTripForClient(trip) });
  } catch (err) {
    console.error('Get trip details error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve trip.' });
  }
});

// POST /api/trips - Publish a Trip to Neon
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      startingLocation,
      destination,
      startDate,
      endDate,
      price,
      seats,
      description,
      departureTime,
    } = req.body;

    if (!startingLocation || !destination || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Starting location, destination, and departure date are required.',
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 4 * 86400000);
    const cost = Number(price) || 4500;
    const maxSeats = Number(seats) || 6;

    const newTrip = await prisma.trip.create({
      data: {
        id: `trip_${Date.now()}`,
        creatorId: req.user.id,
        title: title?.trim() || `${startingLocation.split(',')[0].trim()} to ${destination.split(',')[0].trim()} Expedition`,
        startingCity: startingLocation.trim(),
        destination: destination.trim(),
        startDate: start,
        endDate: end,
        budgetMin: cost,
        budgetMax: Math.round(cost * 1.3),
        groupSize: maxSeats,
        description: description?.trim() || `Group journey from ${startingLocation} to ${destination} departing ${departureTime || 'morning'}.`,
        transport: 'CAR',
        accommodation: 'HOMESTAY',
        travelStyle: 'ADVENTURE',
        intensity: 'MODERATE',
        status: 'PUBLISHED',
      },
      include: {
        User: {
          include: { Profile: true },
        },
        TripMember: true,
      },
    });

    return res.status(201).json({
      success: true,
      trip: formatTripForClient(newTrip),
      message: 'Trip published successfully to Neon database!',
    });
  } catch (err) {
    console.error('Publish trip error:', err);
    return res.status(500).json({ success: false, error: 'Failed to publish trip.' });
  }
});

// POST /api/trips/:id/join-requests - Submit Join Request to TripRequest
router.post('/:id/join-requests', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { TripMember: true },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.creatorId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You are the host of this trip.' });
    }

    const existing = await prisma.tripRequest.findUnique({
      where: {
        tripId_requesterId: {
          tripId: id,
          requesterId: req.user.id,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `You already submitted a request (${existing.status.toLowerCase()}) for this trip.`,
      });
    }

    const request = await prisma.tripRequest.create({
      data: {
        id: `req_${Date.now()}`,
        tripId: id,
        requesterId: req.user.id,
        message: message?.trim() || 'Excited to join this journey!',
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    // Notify trip creator
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}`,
        userId: trip.creatorId,
        type: 'JOIN_REQUEST',
        title: 'New Trip Join Request! 🎒',
        body: `${req.user.name} requested to join "${trip.title}".`,
      },
    });

    return res.status(201).json({
      success: true,
      request,
      message: 'Join request sent to the organizer!',
    });
  } catch (err) {
    console.error('Join request error:', err);
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

    if (trip.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the organizer can view join requests for this trip.',
      });
    }

    const requests = await prisma.tripRequest.findMany({
      where: { tripId: id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            Profile: true,
            Verification: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      count: requests.length,
      requests: requests.map((r) => ({
        id: r.id,
        tripId: r.tripId,
        requesterId: r.requesterId,
        status: r.status,
        message: r.message,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        traveler: {
          id: r.User.id,
          name: r.User.name,
          email: r.User.email,
          avatar: r.User.Profile?.avatarUrl || null,
          bio: r.User.Profile?.bio || '',
          rating: r.User.Profile?.companionRating || 5.0,
          verified: Boolean(r.User.Verification?.verified),
        },
      })),
    });
  } catch (err) {
    console.error('Fetch requests error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve join requests.' });
  }
});

// PUT /api/trips/:id - Edit a trip (Host only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found.' });
    if (trip.creatorId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You are not authorized to edit this trip.' });
    }

    const {
      title,
      description,
      startingLocation,
      destination,
      startDate,
      endDate,
      price,
      seats,
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (startingLocation) updateData.startingCity = startingLocation.trim();
    if (destination) updateData.destination = destination.trim();
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (price) {
      updateData.budgetMin = Number(price);
      updateData.budgetMax = Math.round(Number(price) * 1.3);
    }
    if (seats) updateData.groupSize = Number(seats);

    const updated = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        User: { include: { Profile: true } },
        TripMember: true,
      },
    });

    return res.json({
      success: true,
      trip: formatTripForClient(updated),
      message: 'Trip updated successfully.',
    });
  } catch (err) {
    console.error('Edit trip error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update trip.' });
  }
});

// DELETE /api/trips/:id - Cancel a trip (Host only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { TripMember: true },
    });

    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found.' });
    if (trip.creatorId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You are not authorized to cancel this trip.' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark trip as CANCELLED
      await tx.trip.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // 2. Notify all members
      for (const m of trip.TripMember) {
        await tx.notification.create({
          data: {
            id: `notif_${Date.now()}_${m.userId}`,
            userId: m.userId,
            type: 'TRIP_CANCELLED',
            title: 'Trip Cancelled by Host ⚠️',
            body: `"${trip.title}" has been cancelled by the host.`,
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
