// Orchestrator Service for the Input-Driven Trip Planner
// Combines: Location + Route + Weather + Stay + Food + Activity + Local Transit + Budget + Itinerary

import { resolveLocation } from './locationService.js';
import { calculateTransitOptions } from './routeService.js';
import { getDestinationWeather } from './weatherService.js';
import { calculateStayOptions } from './stayService.js';
import { calculateFoodBudget } from './foodService.js';
import { planActivitiesForTrip } from './activityService.js';
import { calculateLocalTransportCost, buildCompleteBudget } from './budgetService.js';
import { generateDailyItinerary } from './itineraryService.js';
import { discoverDestinationAttractions, geocodeLocation } from './destinationDiscoveryService.js';
import { optimizeTripBudget } from './tripOptimizerService.js';

export async function generateTripPlan(criteria = {}) {
  // 1. Resolve Origin and Destination
  const destInput = criteria.destination || criteria.destinationObj || 'Manali';
  let destination = resolveLocation(destInput);
  if (destination.unresolved || !Number.isFinite(Number(destination.lat)) || !Number.isFinite(Number(destination.lng))) {
    try {
      const geoDest = await geocodeLocation(destination.fullName || destination.city || destInput);
      if (geoDest && Number.isFinite(Number(geoDest.lat)) && Number.isFinite(Number(geoDest.lng))) {
        destination = geoDest;
      }
    } catch {
      // Keep destination object as is
    }
  }

  const originInput = criteria.origin || criteria.startingLocation || criteria.originObj || 'Delhi';
  let origin = resolveLocation(originInput);
  if (origin.unresolved || !Number.isFinite(Number(origin.lat)) || !Number.isFinite(Number(origin.lng))) {
    try {
      const geoOrigin = await geocodeLocation(origin.fullName || origin.city || originInput);
      if (geoOrigin && Number.isFinite(Number(geoOrigin.lat)) && Number.isFinite(Number(geoOrigin.lng))) {
        origin = geoOrigin;
      }
    } catch {
      // Keep origin object as is
    }
  }

  // 2. Dates & Trip Duration
  let days = Number(criteria.days || criteria.duration || 0);
  let nights = Number(criteria.nights || 0);
  let startDate = criteria.startDate || criteria.dates?.startDate || criteria.dates?.start || null;
  let endDate = criteria.endDate || criteria.dates?.endDate || criteria.dates?.end || null;

  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
      const diffMs = e.getTime() - s.getTime();
      days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
      nights = Math.max(1, days - 1);
    }
  }

  if (!days || days < 1) {
    days = 4;
    nights = 3;
  }
  if (!nights || nights < 1) {
    nights = Math.max(1, days - 1);
  }

  // 3. Travelers (Adults & Children)
  const adults = Math.max(1, Number(criteria.adults) || (criteria.travelers ? Number(criteria.travelers) : 2));
  const children = Math.max(0, Number(criteria.children) || 0);
  const totalTravelers = adults + children;

  // 4. Budget (The user's entered budget is the source of truth!)
  const rawUserBudget = criteria.userBudget !== undefined
    ? Number(criteria.userBudget)
    : (criteria.budget !== undefined ? Number(criteria.budget) : 20000);
  const budgetType = criteria.budgetType || 'total';

  // 5. Intelligent Optimization
  const optimized = await optimizeTripBudget({
    origin,
    destination,
    totalTravelers,
    adults,
    children,
    days,
    nights,
    rawUserBudget,
    budgetType,
    startDate,
    endDate,
  });

  const {
    routeData,
    selectedTransport,
    stayData,
    foodData,
    localTransportData,
    miscCost,
    dayPlans,
    budgetData,
    optimization,
  } = optimized;

  // 6. Weather Forecast Estimation
  let travelMonth = new Date().getMonth() + 1;
  if (startDate) {
    const sDate = new Date(startDate);
    if (!isNaN(sDate.getTime())) {
      travelMonth = sDate.getMonth() + 1;
    }
  }
  const weatherData = getDestinationWeather(destination, travelMonth);

  // 7. Structured Day-by-Day Itinerary Scheduling
  const dayByDay = generateDailyItinerary({
    origin,
    destination,
    days,
    dates: { startDate, endDate },
    dayPlans,
    transportOption: selectedTransport,
    stay: stayData,
    food: foodData,
    localTransport: localTransportData,
  });

  // 8. Assemble Final Plan Object
  return {
    id: `plan-${destination.id || 'trip'}-${Date.now()}`,
    tripTitle: `${destination.city} Smart Travel Plan`,
    origin,
    originCity: origin.city,
    destination: destination.fullName || `${destination.city}, ${destination.country || 'India'}`,
    destinationObj: destination,
    destinationCity: destination.city,
    duration: `${days} Days / ${nights} Nights`,
    days,
    nights,
    startDate,
    endDate,
    dates: startDate && endDate ? `${startDate} to ${endDate}` : `${days} Days / ${nights} Nights`,
    travelers: totalTravelers,
    adults,
    children,

    // Budget Engine Results (Exact mathematical match guaranteed)
    totalBudget: budgetData.totalCost,
    perPersonBudget: budgetData.perPersonCost,
    userTargetBudget: budgetData.userTotalBudget,
    userPerPersonBudget: budgetData.userPerPersonBudget,
    budgetType: budgetData.budgetType,
    isOverBudget: optimization.isOverBudget,
    shortfallTotal: optimization.shortfallTotal,
    shortfallPerPerson: optimization.shortfallPerPerson,
    remainingBudget: budgetData.remainingBudget,
    budgetUsedPercent: budgetData.percentUsed,
    budgetBreakdown: budgetData.breakdown,
    optimization,

    // Distance & Weather
    distance: `${routeData.distanceKm} km (${routeData.isInternational ? 'Flight Corridor' : 'Road Distance'})`,
    distanceKm: routeData.distanceKm,
    weather: `${weatherData.tempRange}, ${weatherData.summary}`,
    weatherDetails: weatherData,

    // Stay Recommendation
    stayRecommendation: {
      name: stayData.name,
      type: stayData.type,
      location: stayData.location,
      rating: stayData.rating,
      reviews: stayData.reviews || 64,
      price: stayData.priceLabel,
      nightlyRate: stayData.nightlyRate,
      totalPrice: stayData.totalCost,
      rooms: stayData.roomsRequired,
      roomLabel: stayData.roomDetails,
      nights: stayData.nights,
      amenities: stayData.amenities,
      image: stayData.image,
      isEstimate: true,
    },
    stayDetails: stayData,

    // Transport Recommendation
    transportRecommendation: {
      method: selectedTransport.name,
      type: selectedTransport.type,
      name: selectedTransport.name,
      duration: selectedTransport.durationLabel,
      durationHours: selectedTransport.durationHours,
      route: `${origin.city} ➔ ${destination.city} (${routeData.distanceKm} km)`,
      costPerPerson: `₹${selectedTransport.costPerPerson.toLocaleString('en-IN')}`,
      costPerPersonNum: selectedTransport.costPerPerson,
      totalCost: selectedTransport.totalCost,
      note: selectedTransport.description,
      isEstimate: true,
    },
    allTransportOptions: routeData.options,

    // Local Transport Recommendation
    localTransportRecommendation: {
      mode: localTransportData.label,
      totalCost: localTransportData.totalCost,
      dailyRate: localTransportData.dailyRate,
      perPersonCost: localTransportData.perPersonCost,
      isEstimate: true,
    },

    // Food Recommendation
    foodRecommendation: foodData,

    // Miscellaneous
    miscExpenses: {
      totalCost: miscCost,
      label: 'Bottled water, tea/snacks, local entry permits & light contingency',
      perPersonCost: Math.round(miscCost / totalTravelers),
      isEstimate: true,
    },

    // Structured Day-by-Day Itinerary
    dayByDay,

    // Criteria copy
    criteria: {
      origin: origin.fullName,
      originObj: origin,
      destination: destination.fullName,
      destinationObj: destination,
      startDate,
      endDate,
      days,
      nights,
      adults,
      children,
      travelers: totalTravelers,
      userBudget: rawUserBudget,
      budget: rawUserBudget,
      budgetType,
    },
  };
}
