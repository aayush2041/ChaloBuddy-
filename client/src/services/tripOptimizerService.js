import { resolveLocation } from './locationService.js';
import { calculateTransitOptions } from './routeService.js';
import { calculateStayOptions } from './stayService.js';
import { calculateFoodBudget } from './foodService.js';
import { calculateLocalTransportCost, buildCompleteBudget } from './budgetService.js';
import { discoverDestinationAttractions } from './destinationDiscoveryService.js';
import { planActivitiesForTrip } from './activityService.js';

function normalizeBudget(rawUserBudget, budgetType, travelers) {
  const raw = Math.max(500, Number(rawUserBudget) || 15000);
  const total = budgetType === 'person' ? raw * travelers : raw;
  return { total, perPerson: Math.round(total / Math.max(1, travelers)) };
}

function stayCandidate(destination, travelers, adults, nights, style, type) {
  return calculateStayOptions({
    destination,
    travelers,
    adults,
    nights,
    accommodationPreference: type,
    travelStyle: style,
    roomsRequired: null,
  });
}

function localCandidate(mode, days, travelers, isInternational) {
  return calculateLocalTransportCost({ preference: mode, days, travelers, isInternational });
}

export async function optimizeTripBudget({
  origin,
  destination,
  totalTravelers,
  adults,
  children,
  days,
  nights,
  rawUserBudget,
  budgetType = 'total',
  startDate,
  endDate,
}) {
  const travelersCount = Math.max(1, Number(totalTravelers) || 1);
  const target = normalizeBudget(rawUserBudget, budgetType, travelersCount);

  // Validate coordinates with safe fallback
  const validCoordinate = (value) =>
    value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

  let resolvedOrigin = resolveLocation(origin);
  let resolvedDest = resolveLocation(destination);

  if (!resolvedOrigin?.city || !resolvedDest?.city) {
    throw new Error('Please select both a valid starting location and destination.');
  }

  // Check if international
  const originCountry = (resolvedOrigin.country || 'India').trim().toLowerCase();
  const destCountry = (resolvedDest.country || 'India').trim().toLowerCase();
  const isInternational = originCountry !== destCountry && destCountry !== 'india';

  // 1. Calculate transit options
  const routeData = calculateTransitOptions(resolvedOrigin, resolvedDest, travelersCount, days);
  const transports = Array.isArray(routeData?.options) ? routeData.options.filter(Boolean) : [];
  if (!transports.length) {
    throw new Error('No transportation routes could be calculated for these locations.');
  }

  // 2. Candidate stays: economical to premium
  const stayTypes = isInternational
    ? ['Hostel', 'Budget Hotel', 'Hotel', 'Premium']
    : ['Hostel', 'Budget Hotel', 'Homestay', 'Hotel', 'Resort'];

  const stays = stayTypes.map((type) =>
    stayCandidate(resolvedDest, travelersCount, adults, nights, 'Comfortable', type)
  );

  // 3. Candidate local mobility
  const localModes = isInternational ? ['Public Transport', 'Mixed'] : ['Public Transport', 'Mixed', 'Cab'];
  const locals = localModes.map((mode) => localCandidate(mode, days, travelersCount, isInternational));

  // 4. Attractions & Activities
  let liveAttractions = [];
  try {
    liveAttractions = await discoverDestinationAttractions(
      resolvedDest,
      Math.min(18, Math.max(8, days * 3))
    );
  } catch {
    liveAttractions = [];
  }

  const fallbackPlans = planActivitiesForTrip({
    destination: resolvedDest,
    days,
    interests: ['Sightseeing', 'Nature', 'Culture'],
    intensity: 'Balanced',
  });

  const chosenPlaces = (liveAttractions.length ? liveAttractions : []).slice(0, days * 2);
  const dayPlans = chosenPlaces.length
    ? Array.from({ length: days }, (_, index) => {
        const placesForDay = chosenPlaces.filter((_, i) => i % days === index);
        return {
          day: index + 1,
          neighborhood: resolvedDest.city,
          activities: placesForDay.map((place) => ({
            id: place.id,
            title: place.title,
            desc: place.desc,
            category: 'Sightseeing',
            neighborhood: resolvedDest.city,
            durationHours: 1.5,
            costPerPerson: place.cost || 0,
            image: place.image,
            sourceUrl: place.url,
            source: place.source,
            coordinates: { lat: place.lat, lng: place.lng },
          })),
        };
      })
    : fallbackPlans;

  const activityCostPerPerson = dayPlans.reduce(
    (sum, day) => sum + (day.activities || []).reduce((s, a) => s + (Number(a.costPerPerson) || 0), 0),
    0
  );
  const totalActivitiesCost = activityCostPerPerson * travelersCount;

  // 5. Food options: economical, standard, comfortable
  const foodLevels = ['Budget', 'Comfortable'];
  const foodOptions = foodLevels.map((lvl) =>
    calculateFoodBudget({
      travelers: travelersCount,
      days,
      travelStyle: lvl,
      interests: [],
      requirements: [],
    })
  );

  // 6. Build Candidate Matrix
  // Evaluate all realistic combinations:
  // transport + stay + food + local + activities + misc
  const candidates = [];

  for (const transport of transports) {
    for (const stay of stays) {
      for (const food of foodOptions) {
        for (const local of locals) {
          const directExpenses =
            transport.totalCost +
            stay.totalCost +
            food.totalCost +
            local.totalCost +
            totalActivitiesCost;

          // Misc expenses (~4% of direct expenses or minimum ₹200)
          const miscCost = Math.max(200, Math.round(directExpenses * 0.04));

          // Strict mathematical total
          const totalCost = directExpenses + miscCost;
          const underBudget = totalCost <= target.total;

          // Score candidate: favor comfort/convenience when budget permits
          let score = 0;
          if (underBudget) score += 50;

          // Bonus for reasonable speed without excessive cost
          if (transport.durationHours <= 8) score += 10;
          if (stay.rating >= 4.5) score += 10;

          // Penalty for being over budget
          if (!underBudget) score -= (totalCost - target.total) / 500;

          candidates.push({
            transport,
            stay,
            food,
            local,
            miscCost,
            totalCost,
            underBudget,
            score,
          });
        }
      }
    }
  }

  const feasible = candidates.filter((c) => c.underBudget);
  let selected = null;
  let isPlanFeasible = true;

  if (feasible.length > 0) {
    // Pick the highest scoring feasible candidate (most comfort within budget)
    selected = [...feasible].sort((a, b) => b.score - a.score || b.totalCost - a.totalCost)[0];
  } else {
    // DO NOT fabricate a cheap itinerary!
    // Pick the least-cost realistic candidate and explain the shortfall honestly.
    selected = [...candidates].sort((a, b) => a.totalCost - b.totalCost)[0];
    isPlanFeasible = false;
  }

  // 7. Final Deterministic Budget Object
  const budgetData = buildCompleteBudget({
    transportCost: selected.transport.totalCost,
    stayCost: selected.stay.totalCost,
    foodCost: selected.food.totalCost,
    localTransportCost: selected.local.totalCost,
    activitiesCost: totalActivitiesCost,
    miscCost: selected.miscCost,
    travelers: travelersCount,
    userBudget: rawUserBudget,
    budgetType,
  });

  // Shortfall and Actionable Recommendations
  const shortfallTotal = Math.max(0, budgetData.totalCost - target.total);
  const shortfallPerPerson = Math.round(shortfallTotal / travelersCount);
  const isOverBudget = !isPlanFeasible || budgetData.totalCost > target.total;

  const suggestedDays = Math.max(1, Math.floor(days * (target.total / budgetData.totalCost)));

  const explanationMessage = isOverBudget
    ? `This trip is unlikely to fit within ₹${target.total.toLocaleString('en-IN')} for ${travelersCount} ${travelersCount === 1 ? 'person' : 'people'}.`
    : `Trip comfortably fits within your ₹${target.total.toLocaleString('en-IN')} budget with ₹${(target.total - budgetData.totalCost).toLocaleString('en-IN')} remaining.`;

  const actionableOptions = isOverBudget
    ? [
        `Reduce number of days from ${days} to ${suggestedDays} ${suggestedDays === 1 ? 'day' : 'days'}.`,
        `Increase budget to at least ₹${budgetData.totalCost.toLocaleString('en-IN')} (₹${budgetData.perPersonCost.toLocaleString('en-IN')}/person).`,
        `Choose cheaper transport (e.g. Sleeper Train or AC Bus instead of Flights/Cabs).`,
        `Choose cheaper accommodation (e.g. Social Hostels or Homestays instead of Hotels).`,
      ]
    : [];

  return {
    routeData,
    selectedTransport: selected.transport,
    stayData: selected.stay,
    foodData: selected.food,
    localTransportData: selected.local,
    miscCost: selected.miscCost,
    dayPlans,
    budgetData,
    liveAttractions,
    optimization: {
      feasible: !isOverBudget,
      isOverBudget,
      targetTotal: target.total,
      targetPerPerson: target.perPerson,
      selectedTotal: budgetData.totalCost,
      selectedPerPerson: budgetData.perPersonCost,
      remainingBudget: budgetData.remainingBudget,
      shortfallTotal,
      shortfallPerPerson,
      explanation: explanationMessage,
      actionableOptions,
      candidatesConsidered: candidates.length,
      strategy: isOverBudget
        ? 'Uncompromising reality-first costing: no fabricated low prices'
        : 'Budget-constrained optimal comfort allocation',
    },
  };
}
