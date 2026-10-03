import { resolveLocation } from './locationService.js';
import { calculateTransitOptions } from './routeService.js';
import { calculateStayOptions } from './stayService.js';
import { calculateFoodBudget } from './foodService.js';
import { calculateLocalTransportCost, buildCompleteBudget } from './budgetService.js';
import { discoverDestinationAttractions } from './destinationDiscoveryService.js';
import { planActivitiesForTrip } from './activityService.js';

function normalizeBudget(rawUserBudget, budgetType, travelers) {
  const raw = Number(rawUserBudget) || 15000;
  const total = budgetType === 'person' ? raw * travelers : raw;
  return { total, perPerson: total / Math.max(1, travelers) };
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

function localCandidate(mode, days, travelers) {
  return calculateLocalTransportCost({ preference: mode, days, travelers });
}

function scoreCandidate({ transport, stay, local, style, budgetTotal, travelers }) {
  let score = 0;
  const total = transport.totalCost + stay.totalCost + local.totalCost;
  const perPerson = total / Math.max(1, travelers);

  // Strongly prefer plans that leave a useful buffer.
  score += Math.max(0, budgetTotal - total) / 250;
  // Penalize unnecessary spend.
  score -= total / 1200;

  const s = String(style).toLowerCase();
  const stayType = String(stay.type).toLowerCase();
  if (s.includes('backpack') || s.includes('budget')) {
    if (stayType.includes('hostel') || stayType.includes('budget')) score += 18;
  }
  if (s.includes('family') && !stayType.includes('dorm')) score += 8;
  if (s.includes('luxury') && stayType.includes('premium')) score += 20;
  if (s.includes('comfortable') && stayType.includes('hotel')) score += 8;

  // For longer journeys, value time slightly more without violating budget.
  if (transport.durationHours <= 8) score += 4;
  if (perPerson <= budgetTotal / travelers) score += 3;
  return score;
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
  budgetType,
  budgetFlexibility,
  travelStyle,
  interests,
  specialRequirements = [],
}) {
  const target = normalizeBudget(rawUserBudget, budgetType, totalTravelers);
  const validCoordinate = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  if (!origin?.city || !destination?.city || !validCoordinate(origin?.lat) || !validCoordinate(origin?.lng) || !validCoordinate(destination?.lat) || !validCoordinate(destination?.lng)) {
    throw new Error('Please select valid starting and destination locations from the search suggestions.');
  }

  const routeData = calculateTransitOptions(origin, destination, totalTravelers, days);

  // Candidate transport modes. We never ask the user to pick one.
  const transports = Array.isArray(routeData?.options) ? routeData.options.filter(Boolean) : [];
  if (!transports.length) {
    throw new Error('No intercity transport options could be calculated for these locations.');
  }

  // Candidate stays, ordered from economical to premium. The optimizer decides.
  const stayTypes = ['Hostel', 'Budget Hotel', 'Homestay', 'Hotel', 'Resort', 'Premium'];
  const stays = stayTypes.map((type) =>
    stayCandidate(destination, totalTravelers, adults, nights, travelStyle, type)
  );

  // Candidate local mobility. The planner chooses the least expensive mode that
  // still makes sense for the trip.
  const localModes = ['Mixed', 'Public Transport', 'Cab', 'Rental Car'];
  const locals = localModes.map((mode) => localCandidate(mode, days, totalTravelers));

  let liveAttractions = [];
  try {
    liveAttractions = await discoverDestinationAttractions(
      destination,
      Math.min(18, Math.max(8, days * 4))
    );
  } catch {
    liveAttractions = [];
  }

  const safeInterests = Array.isArray(interests) ? interests : [];
  const safeRequirements = Array.isArray(specialRequirements) ? specialRequirements : [];
  const interestTerms = safeInterests.map((x) => String(x).toLowerCase());
  const ranked = [...liveAttractions].sort((a, b) => {
    const score = (item) => interestTerms.reduce((sum, term) => {
      const hay = `${item.title} ${item.desc}`.toLowerCase();
      return sum + (hay.includes(term) ? 3 : 0);
    }, 0);
    return score(b) - score(a);
  });

  const fallbackPlans = planActivitiesForTrip({
    destination,
    days,
    interests: safeInterests,
    intensity: travelStyle === 'Relaxed' ? 'Relaxed' : travelStyle === 'Adventure' ? 'Packed' : 'Balanced',
  });

  const activitySource = ranked.length ? ranked : [];
  const activityCount = Math.max(1, Math.min(activitySource.length, days * 2));
  const chosenPlaces = activitySource.slice(0, activityCount);

  const dayPlans = chosenPlaces.length
    ? Array.from({ length: days }, (_, index) => {
        const placesForDay = chosenPlaces.filter((_, i) => i % days === index);
        return {
          day: index + 1,
          neighborhood: destination.city,
          activities: placesForDay.map((place) => ({
            id: place.id,
            title: place.title,
            desc: place.desc,
            category: 'Sightseeing',
            neighborhood: destination.city,
            durationHours: 1.5,
            costPerPerson: 0,
            image: place.image,
            sourceUrl: place.url,
            source: place.source,
            coordinates: { lat: place.lat, lng: place.lng },
          })),
        };
      })
    : fallbackPlans;

  const activityCostPerPerson = dayPlans.reduce((sum, day) =>
    sum + (day.activities || []).reduce((s, a) => s + (Number(a.costPerPerson) || 0), 0), 0
  );

  const foodData = calculateFoodBudget({
    travelers: totalTravelers,
    days,
    travelStyle,
    interests: safeInterests,
    requirements: safeRequirements,
  });

  const candidates = [];
  for (const transport of transports) {
    for (const stay of stays) {
      for (const local of locals) {
        const direct =
          transport.totalCost +
          stay.totalCost +
          foodData.totalCost +
          local.totalCost +
          activityCostPerPerson * totalTravelers;

        // Keep the existing safety/misc convention, but enforce the user's
        // actual budget as a hard constraint for the final plan.
        const estimatedTotal = Math.round(direct * 1.10);
        const underBudget = estimatedTotal <= target.total;

        candidates.push({
          transport,
          stay,
          local,
          estimatedTotal,
          underBudget,
          score: scoreCandidate({
            transport,
            stay,
            local,
            style: travelStyle,
            budgetTotal: target.total,
            travelers: totalTravelers,
          }),
        });
      }
    }
  }

  const feasible = candidates.filter((c) => c.underBudget);
  let selected;
  let feasiblePlan = true;

  if (!candidates.length) {
    throw new Error('The planner could not create any feasible transport, stay and local travel combinations.');
  }

  if (feasible.length) {
    selected = [...feasible].sort((a, b) => b.score - a.score || a.estimatedTotal - b.estimatedTotal)[0];
  } else {
    // No fabricated "under budget" result. Return the least-cost realistic
    // candidate so the UI can explain the shortfall.
    selected = [...candidates].sort((a, b) => a.estimatedTotal - b.estimatedTotal)[0];
    feasiblePlan = false;
  }

  const activitiesCost = activityCostPerPerson * totalTravelers;
  const budgetData = buildCompleteBudget({
    transportCost: selected.transport.totalCost,
    stayCost: selected.stay.totalCost,
    foodCost: foodData.totalCost,
    localTransportCost: selected.local.totalCost,
    activitiesCost,
    travelers: totalTravelers,
    userBudget: rawUserBudget,
    budgetType,
    // Strict here: the user's entered budget is the planning constraint.
    budgetFlexibility: 'Strict',
  });

  // If the chosen candidate is within the hard budget but the legacy budget
  // engine adds a buffer that pushes it over, use the candidate's actual
  // estimated total for the final status and keep the budget breakdown.
  const finalTotal = Math.round(
    selected.transport.totalCost +
    selected.stay.totalCost +
    foodData.totalCost +
    selected.local.totalCost +
    activitiesCost
  );
  const finalOverBudget = finalTotal > target.total;

  budgetData.totalCost = finalTotal;
  budgetData.perPersonCost = Math.round(finalTotal / totalTravelers);
  budgetData.isOverBudget = finalOverBudget;
  budgetData.shortfallTotal = Math.max(0, finalTotal - target.total);
  budgetData.shortfallPerPerson = Math.round(budgetData.shortfallTotal / totalTravelers);
  budgetData.remainingBudget = Math.max(0, target.total - finalTotal);
  budgetData.percentUsed = target.total ? Math.round((finalTotal / target.total) * 100) : 100;
  budgetData.breakdown = [
    { key: 'transport', category: 'Intercity Transport', amount: selected.transport.totalCost, perPerson: Math.round(selected.transport.totalCost / totalTravelers) },
    { key: 'stay', category: 'Accommodation', amount: selected.stay.totalCost, perPerson: Math.round(selected.stay.totalCost / totalTravelers) },
    { key: 'food', category: 'Food & Meals', amount: foodData.totalCost, perPerson: Math.round(foodData.totalCost / totalTravelers) },
    { key: 'localTransport', category: 'Local Commute', amount: selected.local.totalCost, perPerson: Math.round(selected.local.totalCost / totalTravelers) },
    { key: 'activities', category: 'Activities & Entry Fees', amount: activitiesCost, perPerson: Math.round(activitiesCost / totalTravelers) },
  ];
  budgetData.warnings = finalOverBudget ? [{
    type: 'warning',
    title: 'Trip is above the requested budget',
    shortfallTotal: budgetData.shortfallTotal,
    shortfallPerPerson: budgetData.shortfallPerPerson,
    message: `The lowest-cost realistic combination we found is approximately ₹${finalTotal.toLocaleString('en-IN')} (₹${budgetData.perPersonCost.toLocaleString('en-IN')}/person), versus your ₹${target.total.toLocaleString('en-IN')} total target.`,
    suggestions: ['Increase the budget', 'Shorten the trip', 'Choose different dates'],
  }] : [];

  return {
    routeData,
    selectedTransport: selected.transport,
    stayData: selected.stay,
    foodData,
    localTransportData: selected.local,
    dayPlans,
    budgetData,
    liveAttractions,
    optimization: {
      feasible: feasiblePlan && !finalOverBudget,
      targetTotal: target.total,
      targetPerPerson: Math.round(target.perPerson),
      selectedTotal: finalTotal,
      selectedPerPerson: Math.round(finalTotal / totalTravelers),
      remainingBudget: Math.max(0, target.total - finalTotal),
      candidatesConsidered: candidates.length,
      strategy: 'Budget-constrained whole-trip optimization',
      note: feasiblePlan
        ? 'Transport, accommodation and local mobility were selected automatically to keep the estimated trip within the requested budget.'
        : 'No combination of the available estimates fit the requested budget; the lowest-cost combination is shown instead of inventing a cheaper plan.',
    },
  };
}
