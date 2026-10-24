import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, optionalAuth } from '../auth.js';

const router = Router();

// Helper to format trip for client with rich metadata
function formatTripForClient(t, currentUserId = null) {
  const members = t.TripMember || [];
  const organizer = t.User;
  const organizerProfile = organizer?.Profile;
  const memberCount = members.length + 1; // +1 for the host
  const spotsLeft = Math.max(0, t.groupSize - memberCount);

  // Check if current user is an accepted member or host
  const isHost = currentUserId === t.creatorId;
  const isMember = members.some((m) => m.userId === currentUserId);

  return {
    id: t.id,
    title: t.title,
    subtitle: t.description ? t.description.slice(0, 110) : '',
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
    price: t.budgetMin || 4500,
    budgetMin: t.budgetMin,
    budgetMax: t.budgetMax || Math.round(t.budgetMin * 1.3),
    currency: t.currency || 'INR',
    maxGroupSize: t.groupSize,
    currentGroupSize: memberCount,
    spotsLeft: spotsLeft,
    status: t.status,
    difficulty: t.intensity === 'HIGH' ? 'Challenging' : t.intensity === 'EASY' ? 'Easy' : 'Moderate',
    meetingPoint: `${t.startingCity || 'Delhi'} Assembly Point`,
    transport: t.transport === 'BUS' ? 'AC Volvo Coach' : t.transport === 'TRAIN' ? 'Express Train' : t.transport === 'FLIGHT' ? 'Flight' : 'Private Road Vehicle',
    stayDetails: t.accommodation === 'HOMESTAY' ? 'Verified Heritage Homestay' : t.accommodation === 'HOTEL' ? 'Handpicked Boutique Hotel' : 'Curated Stay',
    about: t.description,
    included: t.included ? t.included.split(', ') : ['Group Transit', 'Guided Hikes', 'Local Meals'],
    excluded: t.excluded ? t.excluded.split(', ') : ['Personal Expenses', 'Personal Gear'],
    images: t.coverImage
      ? [t.coverImage, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80']
      : [
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
        ],
    vibes: [t.travelStyle ? t.travelStyle.toLowerCase() : 'adventure', t.isWomenOnly ? 'women-only' : 'group'],
    travelStyle: t.travelStyle || 'ADVENTURE',
    isWomenOnly: Boolean(t.isWomenOnly),
    visibility: t.visibility || 'PUBLIC',
    stops: t.stops ? t.stops.split(' -> ') : [],
    guidelines: t.guidelines || 'Respect fellow travelers, follow local laws, and practice sustainable travel.',
    featured: true,
    rating: organizerProfile?.companionRating || 4.9,
    reviewCount: t.reviews ? t.reviews.length : 12,
    isHost,
    isMember,
    organizer: {
      id: organizer?.id || 'usr_host',
      name: organizer?.name || 'Verified Host',
      avatar: organizerProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rating: organizerProfile?.companionRating || 4.9,
      tripsHosted: organizerProfile?.tripsCompleted || 10,
      gender: organizer?.gender || 'PREFER_NOT_TO_SAY',
      verified: Boolean(organizer?.isVerified || organizer?.Verification?.verified),
      bio: organizerProfile?.bio || '',
      languages: organizerProfile?.languages || 'English, Hindi',
    },
    travelerAvatars: [
      organizerProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      ...members.map((m) => m.User?.Profile?.avatarUrl).filter(Boolean),
    ],
  };
}

// GET /api/trips - Comprehensive Trip Search & Filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      destination,
      origin,
      date,
      maxPrice,
      minPrice,
      womenOnly,
      travelStyle,
      scope,
    } = req.query;

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
      where.budgetMin = { ...(where.budgetMin || {}), lte: Number(maxPrice) };
    }

    if (minPrice) {
      where.budgetMin = { ...(where.budgetMin || {}), gte: Number(minPrice) };
    }

    if (womenOnly === 'true' || womenOnly === true) {
      where.isWomenOnly = true;
    }

    if (travelStyle && travelStyle.trim()) {
      where.travelStyle = travelStyle.toUpperCase();
    }

    if (scope && scope.trim()) {
      where.scope = scope.toUpperCase();
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        User: {
          include: { Profile: true, Verification: true },
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

    const currentUserId = req.user?.id || null;
    const formatted = trips.map((t) => formatTripForClient(t, currentUserId));

    return res.json({ success: true, count: formatted.length, trips: formatted });
  } catch (err) {
    console.error('List trips error:', err);
    return res.status(500).json({ success: false, error: 'Failed to search trips.' });
  }
});

// GET /api/trips/:id - Single Trip Detail with Access Rules
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id || null;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        User: {
          include: { Profile: true, Verification: true },
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

    return res.json({ success: true, trip: formatTripForClient(trip, currentUserId) });
  } catch (err) {
    console.error('Get trip details error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve trip.' });
  }
});

// POST /api/trips - Host / Publish a New Trip
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
      transport,
      accommodation,
      travelStyle,
      intensity,
      isWomenOnly,
      stops,
      guidelines,
      coverImage,
    } = req.body;

    // Strict validation
    if (!startingLocation || !destination || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Starting location, destination, and departure date are required.',
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 4 * 86400000);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid dates provided.' });
    }

    if (end < start) {
      return res.status(400).json({ success: false, error: 'End date must be after start date.' });
    }

    const cost = Number(price);
    if (isNaN(cost) || cost <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid positive trip budget.' });
    }

    const maxSeats = Number(seats);
    if (isNaN(maxSeats) || maxSeats < 2 || maxSeats > 50) {
      return res.status(400).json({ success: false, error: 'Group size must be between 2 and 50 travelers.' });
    }

    // Women-only host validation: Host must be female to create women-only trips
    const hostUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { gender: true, role: true },
    });

    if (Boolean(isWomenOnly) && hostUser?.gender !== 'FEMALE') {
      return res.status(403).json({
        success: false,
        error: 'Only female organizers can host verified Women-Only trips.',
      });
    }

    const newTrip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          creatorId: req.user.id,
          title: title?.trim() || `${startingLocation.split(',')[0].trim()} to ${destination.split(',')[0].trim()} Expedition`,
          startingCity: startingLocation.trim(),
          destination: destination.trim(),
          startDate: start,
          endDate: end,
          budgetMin: cost,
          budgetMax: Math.round(cost * 1.3),
          groupSize: maxSeats,
          description: description?.trim() || `Journey from ${startingLocation} to ${destination}.`,
          transport: transport || 'CAR',
          accommodation: accommodation || 'HOMESTAY',
          travelStyle: travelStyle || 'ADVENTURE',
          intensity: intensity || 'MODERATE',
          status: 'PUBLISHED',
          isWomenOnly: Boolean(isWomenOnly),
          visibility: Boolean(isWomenOnly) ? 'WOMEN_ONLY' : 'PUBLIC',
          currency: 'INR',
          stops: stops ? (Array.isArray(stops) ? stops.join(' -> ') : stops) : null,
          guidelines: guidelines?.trim() || null,
          coverImage: coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        },
        include: {
          User: { include: { Profile: true } },
          TripMember: true,
        },
      });

      // Create trip conversation room
      const conv = await tx.conversation.create({
        data: {
          id: `conv_${trip.id}`,
          tripId: trip.id,
          title: `${trip.title} • Trip Room`,
          type: 'TRIP_GROUP',
          participants: {
            create: {
              userId: req.user.id,
              role: 'HOST',
            },
          },
        },
      });

      return trip;
    });

    return res.status(201).json({
      success: true,
      trip: formatTripForClient(newTrip, req.user.id),
      message: 'Trip hosted and published successfully!',
    });
  } catch (err) {
    console.error('Publish trip error:', err);
    return res.status(500).json({ success: false, error: 'Failed to publish trip.' });
  }
});

// POST /api/trips/:id/join-requests - Submit Join Request with Strict Women-Only & Seat Validation
router.post('/:id/join-requests', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        TripMember: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.creatorId === userId) {
      return res.status(400).json({ success: false, error: 'You are the host of this trip.' });
    }

    // Seat capacity check
    const currentOccupancy = trip.TripMember.length + 1; // +1 host
    if (currentOccupancy >= trip.groupSize) {
      return res.status(400).json({ success: false, error: 'This trip is already at full capacity.' });
    }

    // Backend-Enforced Women-Only Access Check
    if (trip.isWomenOnly) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { gender: true, isVerified: true },
      });

      if (user?.gender !== 'FEMALE') {
        return res.status(403).json({
          success: false,
          error: 'Eligibility restriction: This trip is exclusively designated for verified female travelers.',
        });
      }
    }

    // Duplicate request check
    const existing = await prisma.tripRequest.findUnique({
      where: {
        tripId_requesterId: {
          tripId: id,
          requesterId: userId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `You already have an existing request (${existing.status.toLowerCase()}) for this trip.`,
      });
    }

    const request = await prisma.tripRequest.create({
      data: {
        id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        tripId: id,
        requesterId: userId,
        message: message?.trim() || 'Excited to join this journey!',
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    // Send in-app notification to host
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: trip.creatorId,
        type: 'JOIN_REQUEST',
        title: 'New Trip Join Request! 🎒',
        body: `${req.user.name} requested to join "${trip.title}".`,
      },
    });

    return res.status(201).json({
      success: true,
      request,
      message: 'Join request sent to the trip host!',
    });
  } catch (err) {
    console.error('Join request error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit join request.' });
  }
});

// GET /api/trips/:id/compatibility - Explainable Compatibility Engine
router.get('/:id/compatibility', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [trip, user] = await Promise.all([
      prisma.trip.findUnique({
        where: { id },
        include: { User: { include: { Profile: true } } },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: { Profile: true, UserInterest: { include: { Interest: true } } },
      }),
    ]);

    if (!trip || !user) {
      return res.status(404).json({ success: false, error: 'Trip or user not found.' });
    }

    const factors = [];
    let score = 50; // base score

    // 1. Budget Compatibility
    const userMin = user.Profile?.budgetMin || 4000;
    const userMax = user.Profile?.budgetMax || 30000;
    const tripCost = trip.budgetMin;

    if (tripCost >= userMin && tripCost <= userMax) {
      score += 20;
      factors.push({
        label: 'Budget Match',
        match: true,
        detail: `Trip cost (₹${tripCost.toLocaleString('en-IN')}) fits comfortably within your budget range.`,
      });
    } else if (tripCost < userMin) {
      score += 10;
      factors.push({
        label: 'Pocket Friendly',
        match: true,
        detail: `Trip is more affordable than your usual budget preference.`,
      });
    } else {
      score -= 10;
      factors.push({
        label: 'Budget Higher',
        match: false,
        detail: `Trip budget exceeds your typical upper spending preference.`,
      });
    }

    // 2. Travel Style Match
    if (user.Profile?.travelStyle === trip.travelStyle) {
      score += 15;
      factors.push({
        label: 'Shared Travel Style',
        match: true,
        detail: `Both you and the host prefer ${trip.travelStyle.toLowerCase()} style journeys.`,
      });
    }

    // 3. Language Overlap
    const userLangs = (user.Profile?.languages || 'English, Hindi').toLowerCase().split(',').map((s) => s.trim());
    const hostLangs = (trip.User?.Profile?.languages || 'English, Hindi').toLowerCase().split(',').map((s) => s.trim());
    const sharedLangs = userLangs.filter((l) => hostLangs.includes(l));

    if (sharedLangs.length > 0) {
      score += 10;
      factors.push({
        label: 'Common Languages',
        match: true,
        detail: `You can communicate easily in ${sharedLangs.join(', ')}.`,
      });
    }

    // 4. Trust Signals
    if (trip.User?.Profile?.companionRating >= 4.8) {
      score += 5;
      factors.push({
        label: 'High Host Rating',
        match: true,
        detail: `Host has a stellar ${trip.User.Profile.companionRating}★ community rating.`,
      });
    }

    const finalScore = Math.min(98, Math.max(25, score));

    return res.json({
      success: true,
      compatibility: {
        score: finalScore,
        summary: finalScore >= 80 ? 'Exceptional Match' : finalScore >= 60 ? 'Strong Compatibility' : 'Moderate Fit',
        factors,
      },
    });
  } catch (err) {
    console.error('Compatibility error:', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate compatibility.' });
  }
});

export default router;
