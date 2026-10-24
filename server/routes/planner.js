import { Router } from 'express';
import prisma from '../db.js';
import { authenticateToken, optionalAuth } from '../auth.js';
import { computeMultimodalRoutes } from '../services/multimodalRouteService.js';
import { INITIAL_STAYS } from '../../client/src/data/seedData.js';
import { ACTIVITIES_DATABASE } from '../../client/src/services/activityService.js';

const router = Router();

// POST /api/planner/routes - Multimodal Route Discovery (Rome2Rio inspired)
router.post('/routes', optionalAuth, async (req, res) => {
  try {
    const { origin, destination, travelers, tripDays, departureDate } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, error: 'Origin and destination are required.' });
    }

    const routeData = computeMultimodalRoutes(
      origin,
      destination,
      travelers || 2,
      tripDays || 4,
      departureDate
    );

    return res.json({ success: true, ...routeData });
  } catch (err) {
    console.error('Planner route error:', err);
    return res.status(500).json({ success: false, error: 'Failed to compute multimodal routes.' });
  }
});

// POST /api/planner/generate - Day-by-Day Itinerary & Deterministic Budget Engine
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const {
      origin,
      destination,
      startDate,
      endDate,
      travelers,
      budgetBasis, // 'TOTAL' or 'PER_PERSON'
      budgetAmount,
      selectedRouteMode,
      selectedStayId,
    } = req.body;

    if (!origin || !destination || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Origin, destination, and travel dates are required.' });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const diffMs = eDate.getTime() - sDate.getTime();
    const daysCount = Math.max(1, Math.round(diffMs / 86400000) + 1);
    const nightsCount = Math.max(1, daysCount - 1);
    const numTravelers = Math.max(1, Number(travelers) || 2);

    // 1. Multimodal Route Search
    const routeComparison = computeMultimodalRoutes(origin, destination, numTravelers, daysCount, startDate);

    let chosenRoute = routeComparison.cheapest;
    if (selectedRouteMode) {
      chosenRoute = routeComparison.allRoutes.find((r) => r.mode === selectedRouteMode) || chosenRoute;
    }

    // 2. Real Accommodation Selection
    const cleanDest = destination.toLowerCase();
    const matchingStays = INITIAL_STAYS.filter(
      (s) => s.location.toLowerCase().includes(cleanDest) || cleanDest.includes(s.location.toLowerCase().split(',')[0].trim())
    );
    const staysPool = matchingStays.length > 0 ? matchingStays : INITIAL_STAYS;

    let chosenStay = staysPool[0];
    if (selectedStayId) {
      chosenStay = INITIAL_STAYS.find((s) => s.id === selectedStayId) || chosenStay;
    }

    // Accommodation cost calculation (Twin sharing: 2 travelers per room)
    const roomsRequired = Math.ceil(numTravelers / 2);
    const nightlyRate = chosenStay.pricePerNight || 2400;
    const totalStayCost = nightlyRate * nightsCount * roomsRequired;
    const stayCostPerPerson = Math.round(totalStayCost / numTravelers);

    // 3. Attractions & Day-by-day Itinerary Generation
    const destKey = destination.split(',')[0].trim().toLowerCase();
    const availableAttractions = ACTIVITIES_DATABASE[destKey] || ACTIVITIES_DATABASE['manali'] || [];

    const days = [];
    let cumulativeActivityCost = 0;
    let cumulativeFoodCost = 0;
    const dailyFoodAllowancePerPerson = 850; // Breakfast, Lunch, Dinner average

    for (let d = 1; d <= daysCount; d++) {
      const dayDate = new Date(sDate.getTime() + (d - 1) * 86400000);
      const isFirstDay = d === 1;
      const isLastDay = d === daysCount;

      let morningActivity, afternoonActivity, eveningActivity;

      if (isFirstDay) {
        morningActivity = {
          time: '07:30 AM – 11:30 AM',
          title: `Departure from ${origin}`,
          description: `Transit via ${chosenRoute.name}. Duration: ${chosenRoute.durationLabel}.`,
          cost: 0,
          type: 'TRANSIT',
        };
        afternoonActivity = {
          time: '12:30 PM – 02:30 PM',
          title: `Check-in at ${chosenStay.name}`,
          description: `Check into room (${roomsRequired} room(s) reserved), unpack and freshen up.`,
          cost: 0,
          type: 'STAY',
        };
        eveningActivity = {
          time: '04:30 PM – 07:30 PM',
          title: `Sunset Walk & Orientation`,
          description: `Stroll through the local village or main promenade. Enjoy local evening tea & snacks.`,
          cost: 300,
          type: 'SIGHTSEEING',
        };
      } else if (isLastDay) {
        morningActivity = {
          time: '08:00 AM – 10:30 AM',
          title: `Farewell Sightseeing & Local Souvenirs`,
          description: `Last walk through the local market. Check out from ${chosenStay.name} by 11:00 AM.`,
          cost: 200,
          type: 'LEISURE',
        };
        afternoonActivity = {
          time: '12:00 PM – 04:30 PM',
          title: `Return Transit to ${origin}`,
          description: `Commence return journey via ${chosenRoute.carrier || chosenRoute.name}.`,
          cost: 0,
          type: 'TRANSIT',
        };
        eveningActivity = {
          time: '07:00 PM',
          title: `Arrive Home Safely`,
          description: `Reach assembly point in ${origin} with memorable travel stories.`,
          cost: 0,
          type: 'TRANSIT',
        };
      } else {
        const attr1 = availableAttractions[(d * 2 - 2) % availableAttractions.length] || {
          name: `${destination} Scenic Viewpoint`,
          description: 'Panoramic sunrise viewpoint over the valley.',
          estimatedCost: 150,
        };
        const attr2 = availableAttractions[(d * 2 - 1) % availableAttractions.length] || {
          name: `Historic Heritage Site`,
          description: 'Explore ancient architecture and local handicraft artisans.',
          estimatedCost: 250,
        };

        morningActivity = {
          time: '09:00 AM – 12:30 PM',
          title: attr1.name,
          description: attr1.description || 'Guided exploration and photography.',
          cost: attr1.estimatedCost || 200,
          type: 'SIGHTSEEING',
        };
        afternoonActivity = {
          time: '02:00 PM – 05:00 PM',
          title: attr2.name,
          description: attr2.description || 'Discover cultural landmarks and scenic spots.',
          cost: attr2.estimatedCost || 250,
          type: 'SIGHTSEEING',
        };
        eveningActivity = {
          time: '06:30 PM – 09:00 PM',
          title: 'Campfire & Authentic Local Dinner',
          description: 'Unwind with regional gastronomy and fellow travel buddies.',
          cost: 400,
          type: 'DINING',
        };
      }

      const dayActivityCost = (morningActivity.cost + afternoonActivity.cost + eveningActivity.cost) * numTravelers;
      cumulativeActivityCost += dayActivityCost;

      const dayFoodCost = dailyFoodAllowancePerPerson * numTravelers;
      cumulativeFoodCost += dayFoodCost;

      days.push({
        dayNumber: d,
        date: dayDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
        title: isFirstDay ? 'Arrival & Welcome' : isLastDay ? 'Departure & Reflection' : `Exploring ${destination}`,
        activities: [morningActivity, afternoonActivity, eveningActivity],
      });
    }

    // 4. Budget Integrity Calculations
    const transitCost = chosenRoute.totalCost;
    const accommodationCost = totalStayCost;
    const foodCost = cumulativeFoodCost;
    const activitiesCost = cumulativeActivityCost;
    const localTransportCost = 450 * daysCount * numTravelers; // local auto/taxis
    const taxesAndFees = Math.round((accommodationCost + transitCost) * 0.05); // 5% GST on commercial travel/stays
    const subtotal = transitCost + accommodationCost + foodCost + activitiesCost + localTransportCost + taxesAndFees;
    const contingencyAllowance = Math.round(subtotal * 0.10); // 10% safety cushion
    const totalGroupCost = subtotal + contingencyAllowance;
    const costPerPerson = Math.round(totalGroupCost / numTravelers);

    // Budget Feasibility Evaluation
    const targetBudget = Number(budgetAmount) || (budgetBasis === 'PER_PERSON' ? 12000 : 25000);
    const totalTarget = budgetBasis === 'PER_PERSON' ? targetBudget * numTravelers : targetBudget;
    const isWithinBudget = totalGroupCost <= totalTarget;
    const variance = totalTarget - totalGroupCost;

    const costBreakdown = [
      {
        category: 'Intercity Transport',
        amount: transitCost,
        perPerson: Math.round(transitCost / numTravelers),
        basis: `${chosenRoute.name} (${chosenRoute.priceClassification})`,
        source: chosenRoute.dataSource,
      },
      {
        category: 'Accommodation',
        amount: accommodationCost,
        perPerson: stayCostPerPerson,
        basis: `${nightsCount} nights in ${chosenStay.name} (${roomsRequired} room(s))`,
        source: 'Handpicked Verified Partner Stays',
      },
      {
        category: 'Meals & Food Allowance',
        amount: foodCost,
        perPerson: Math.round(foodCost / numTravelers),
        basis: `₹${dailyFoodAllowancePerPerson}/day × ${daysCount} days`,
        source: 'ChaloBuddy Standard Meal Index',
      },
      {
        category: 'Sightseeing & Activities',
        amount: activitiesCost,
        perPerson: Math.round(activitiesCost / numTravelers),
        basis: `Entry permits & activity visits across ${daysCount} days`,
        source: 'Local Attraction Tariffs',
      },
      {
        category: 'Local Transit / Transfers',
        amount: localTransportCost,
        perPerson: Math.round(localTransportCost / numTravelers),
        basis: 'Local auto rickshaws & destination transfers',
        source: 'Calculated Local Transit Card',
      },
      {
        category: 'Taxes & Mandatory Fees (GST 5%)',
        amount: taxesAndFees,
        perPerson: Math.round(taxesAndFees / numTravelers),
        basis: 'Standard Goods & Services Tax on Hospitality & Transit',
        source: 'Statutory Regulatory Schedule',
      },
      {
        category: 'Contingency Cushion (10%)',
        amount: contingencyAllowance,
        perPerson: Math.round(contingencyAllowance / numTravelers),
        basis: 'Buffer for unforeseen transit delays or weather changes',
        source: 'ChaloBuddy Prudent Planning Standard',
      },
    ];

    return res.json({
      success: true,
      itinerary: {
        title: `${daysCount}-Day ${destination} Discovery`,
        origin,
        destination,
        startDate,
        endDate,
        daysCount,
        nightsCount,
        travelers: numTravelers,
        roomsRequired,
        selectedRoute: chosenRoute,
        selectedStay: chosenStay,
        allRoutes: routeComparison.allRoutes,
        availableStays: staysPool.slice(0, 6),
        days,
        pricing: {
          totalGroupCost,
          costPerPerson,
          targetBudget: totalTarget,
          targetBasis: budgetBasis || 'TOTAL',
          isWithinBudget,
          variance,
          currency: 'INR',
          breakdown: costBreakdown,
        },
      },
    });
  } catch (err) {
    console.error('Itinerary generation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate itinerary.' });
  }
});

// POST /api/planner/saved-plans - Save Itinerary Plan to Database
router.post('/saved-plans', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      origin,
      destination,
      startDate,
      endDate,
      travelers,
      budgetBasis,
      totalBudget,
      routeDetails,
      accommodationDetails,
      itineraryDays,
      costBreakdown,
      notes,
    } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, error: 'Origin and destination are required to save a plan.' });
    }

    const savedPlan = await prisma.savedPlan.create({
      data: {
        id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: req.user.id,
        title: title?.trim() || `${origin} to ${destination} Journey`,
        origin: origin.trim(),
        destination: destination.trim(),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        travelers: Number(travelers) || 2,
        budgetBasis: budgetBasis || 'TOTAL',
        totalBudget: Number(totalBudget) || 0,
        currency: 'INR',
        routeDetails: routeDetails || null,
        accommodationDetails: accommodationDetails || null,
        itineraryDays: itineraryDays || null,
        costBreakdown: costBreakdown || null,
        notes: notes?.trim() || null,
      },
    });

    return res.status(201).json({
      success: true,
      savedPlan,
      message: 'Itinerary saved successfully to your travel workspace!',
    });
  } catch (err) {
    console.error('Save plan error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save itinerary plan.' });
  }
});

// GET /api/planner/saved-plans - List Current User's Saved Itineraries
router.get('/saved-plans', authenticateToken, async (req, res) => {
  try {
    const plans = await prisma.savedPlan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: plans.length, plans });
  } catch (err) {
    console.error('Fetch saved plans error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve saved plans.' });
  }
});

// GET /api/planner/saved-plans/:id - Retrieve Specific Saved Itinerary
router.get('/saved-plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.savedPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Saved plan not found.' });
    }

    if (plan.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You are not authorized to view this plan.' });
    }

    return res.json({ success: true, plan });
  } catch (err) {
    console.error('Get plan error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch saved plan.' });
  }
});

// DELETE /api/planner/saved-plans/:id - Delete Saved Itinerary
router.delete('/saved-plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.savedPlan.findUnique({ where: { id } });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found.' });
    if (plan.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this plan.' });
    }

    await prisma.savedPlan.delete({ where: { id } });

    return res.json({ success: true, message: 'Plan deleted successfully.' });
  } catch (err) {
    console.error('Delete plan error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete saved plan.' });
  }
});

export default router;
