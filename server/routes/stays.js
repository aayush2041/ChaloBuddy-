import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, optionalAuth } from '../auth.js';

const router = Router();

// GET /api/stays
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { destination, maxPrice, type } = req.query;

    const where = {};
    if (destination) {
      where.OR = [
        { location: { contains: destination.trim(), mode: 'insensitive' } },
        { name: { contains: destination.trim(), mode: 'insensitive' } },
      ];
    }
    if (maxPrice) where.pricePerNight = { lte: Number(maxPrice) };
    if (type) where.type = type;

    const stays = await prisma.stay.findMany({
      where,
      orderBy: { rating: 'desc' },
    });

    return res.json({ success: true, count: stays.length, stays });
  } catch (err) {
    console.error('Fetch stays error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve stays.' });
  }
});

// GET /api/stays/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const stay = await prisma.stay.findUnique({ where: { id } });
    if (!stay) return res.status(404).json({ success: false, error: 'Stay not found.' });
    return res.json({ success: true, stay });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve stay details.' });
  }
});

// POST /api/stays/:id/book - Reserve a stay
router.post('/:id/book', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, guests, roomName, totalAmount } = req.body;

    const stay = await prisma.stay.findUnique({ where: { id } });
    if (!stay) return res.status(404).json({ success: false, error: 'Stay not found.' });

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.stayBooking.create({
        data: {
          stayId: id,
          userId: req.user.id,
          checkIn: new Date(checkIn || Date.now()),
          checkOut: new Date(checkOut || Date.now() + 3 * 86400000),
          guests: Number(guests) || 1,
          roomName: roomName || 'Standard Suite',
          totalAmount: Number(totalAmount) || Number(stay.pricePerNight),
        },
      });

      await tx.notification.create({
        data: {
          userId: req.user.id,
          title: 'Stay Reservation Confirmed! 🏡',
          desc: `Your reservation at ${stay.name} is confirmed. Booking ID: RES-${b.id.slice(-5).toUpperCase()}`,
          link: `#/my-trips`,
        },
      });

      return b;
    });

    return res.status(201).json({ success: true, booking, message: 'Reservation confirmed!' });
  } catch (err) {
    console.error('Book stay error:', err);
    return res.status(500).json({ success: false, error: 'Failed to reserve stay.' });
  }
});

export default router;
