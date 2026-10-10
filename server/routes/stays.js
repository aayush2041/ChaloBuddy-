import { Router } from 'express';
import { INITIAL_STAYS } from '../../client/src/data/seedData.js';
import { authenticateToken, optionalAuth } from '../auth.js';

const router = Router();

// GET /api/stays
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { destination, maxPrice, type } = req.query;

    let filtered = [...INITIAL_STAYS];
    if (destination) {
      filtered = filtered.filter(
        (s) =>
          s.location.toLowerCase().includes(destination.toLowerCase()) ||
          s.name.toLowerCase().includes(destination.toLowerCase())
      );
    }
    if (maxPrice) {
      filtered = filtered.filter((s) => s.pricePerNight <= Number(maxPrice));
    }
    if (type) {
      filtered = filtered.filter((s) => s.type === type);
    }

    return res.json({ success: true, count: filtered.length, stays: filtered });
  } catch (err) {
    console.error('Fetch stays error:', err);
    return res.json({ success: true, count: INITIAL_STAYS.length, stays: INITIAL_STAYS });
  }
});

// GET /api/stays/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;
  const stay = INITIAL_STAYS.find((s) => s.id === id) || INITIAL_STAYS[0];
  return res.json({ success: true, stay });
});

// POST /api/stays/:id/book
router.post('/:id/book', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const stay = INITIAL_STAYS.find((s) => s.id === id) || INITIAL_STAYS[0];

  return res.status(201).json({
    success: true,
    bookingId: `RES-${Date.now().toString().slice(-5)}`,
    stay,
    message: `Reservation confirmed at ${stay.name}!`,
  });
});

export default router;
