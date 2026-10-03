// Orchestrator Service for the Input-Driven Trip Planner
// Combines: Location + Route + Weather + Stay + Food + Activity + Local Transit + Budget + Itinerary

import { resolveLocation } from './locationService.js';
import { calculateTransitOptions, selectPreferredTransport } from './routeService.js';
import { getDestinationWeather } from './weatherService.js';
import { calculateStayOptions } from './stayService.js';
import { calculateFoodBudget } from './foodService.js';
import { planActivitiesForTrip } from './activityService.js';
import { calculateLocalTransportCost, buildCompleteBudget } from './budgetService.js';
import { generateDailyItinerary } from './itineraryService.js';
import { discoverDestinationAttractions } from './destinationDiscoveryService.js';
import { optimizeTripBudget } from './tripOptimizerService.js';

export async function generateTripPlan(criteria = {}) {
  // 1. Resolve Locations (Origin & Destination)
  const destInput = criteria.destination || criteria.destinationObj || 'Dehradun';
  const destination = resolveLocation(destInput);

  const originInput = criteria.origin || criteria.startingLocation || criteria.originObj || 'Delhi';
  const origin = resolveLocation(originInput);

  // 2. Dates & Trip Duration
  let days = Number(criteria.days || criteria.duration || 0);
  let nights = Number(criteria.nights || 0);
  let startDate = criteria.startDate || criteria.dates?.startDate || null;
  let endDate = criteria.endDate || criteria.dates?.endDate || null;

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

  // 3. Travelers (Adults, Children, Infants)
  const adults = Math.max(1, Number(criteria.adults) || (criteria.travelers ? Number(criteria.travelers) : 2));
  const children = Math.max(0, Number(criteria.children) || 0);
  const infants = Math.max(0, Number(criteria.infants) || 0);
  const totalTravelers = adults + children; // infants generally don't incur seat/bed costs

  const rawUserBudget = criteria.userBudget !== undefined
    ? Number(criteria.userBudget)
    : (criteria.budget !== undefined ? Number(criteria.budget) : 15000);

  // 4-9. Smart planning: the user gives constraints; the planner chooses
  // intercity transit, accommodation, local transport and paid activities.
  // Nothing below is exposed as a mandatory user selection.
  const optimized = await optimizeTripBudget({
    origin,
    destination,
    totalTravelers,
    adults,
    children,
    days,
    nights,
    rawUserBudget,
    budgetType: criteria.budgetType || 'person',
    budgetFlexibility: criteria.budgetFlexibility || 'Strict',
    travelStyle: Array.isArray(criteria.travelStyle) ? criteria.travelStyle[0] : (criteria.travelStyle || 'Comfortable'),
    interests: Array.isArray(criteria.interests) ? criteria.interests : [],
    specialRequirements: Array.isArray(criteria.specialRequirements) ? criteria.specialRequirements : [],
    startDate,
    endDate,
  });

  const {
    routeData,
    selectedTransport,
    stayData,
    foodData,
    localTransportData,
    dayPlans,
    budgetData,
    liveAttractions,
    optimization,
  } = optimized;

  const transportCost = selectedTransport.totalCost || (selectedTransport.costPerPerson * totalTravelers);
  const stayCost = stayData.totalCost;
  const foodCost = foodData.totalCost;
  const localTransportCost = localTransportData.totalCost;
  const activitiesCost = dayPlans.reduce((sum, d) =>
    sum + (d.activities || []).reduce((s, a) => s + (Number(a.costPerPerson) || 0), 0), 0
  ) * totalTravelers;

  // 10. Weather Forecast Estimation
  let travelMonth = new Date().getMonth() + 1;
  if (startDate) {
    const sDate = new Date(startDate);
    if (!isNaN(sDate.getTime())) {
      travelMonth = sDate.getMonth() + 1;
    }
  }
  const weatherData = getDestinationWeather(destination, travelMonth);

  // 11. Structured Day-by-Day Itinerary Scheduling
  const dayByDay = generateDailyItinerary({
    origin,
    destination,
    days,
    dates: { startDate, endDate },
    dayPlans,
    transportOption: selectedTransport,
    stay: stayData,
    food: foodData,
  });

  // 12. Travel Style Formatter
  const formattedStyle = Array.isArray(criteria.travelStyle)
    ? criteria.travelStyle.join(', ')
    : (criteria.travelStyle || 'Comfortable');

  // 13. Assemble Final Complete Smart Plan
  return {
    id: `plan-${destination.id}-${Date.now()}`,
    tripTitle: `${destination.city} ${Array.isArray(criteria.travelStyle) && criteria.travelStyle[0] ? criteria.travelStyle[0] : 'Exploration'}`,
    origin: origin,
    originCity: origin.city,
    destination: destination.fullName,
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
    infants,
    travelStyle: formattedStyle,
    interests: Array.isArray(criteria.interests) ? criteria.interests : [],
    activityIntensity: criteria.activityIntensity || 'Balanced',
    specialRequirements: Array.isArray(criteria.specialRequirements) ? criteria.specialRequirements : [],

    // Budget Engine Results
    totalBudget: budgetData.totalCost,
    perPersonBudget: budgetData.perPersonCost,
    userTargetBudget: budgetData.userTotalBudget,
    userPerPersonBudget: budgetData.userPerPersonBudget,
    budgetType: budgetData.budgetType,
    budgetFlexibility: budgetData.budgetFlexibility,
    budgetStatus: budgetData.isOverBudget ? 'over_budget' : 'within_budget',
    isOverBudget: budgetData.isOverBudget,
    optimization,
    shortfall: {
      total: budgetData.shortfallTotal,
      perPerson: budgetData.shortfallPerPerson,
      warnings: budgetData.warnings,
      suggestions: budgetData.warnings?.[0]?.suggestions || [],
    },
    budgetUsedPercent: budgetData.percentUsed,
    budgetBreakdown: budgetData.breakdown,


    // Distance & Weather
    distance: `${routeData.distanceKm} km (Road Distance)`,
    distanceKm: routeData.distanceKm,
    weather: `${weatherData.tempRange}, ${weatherData.summary}`,
    weatherDetails: weatherData,

    // Stay Recommendation
    stayRecommendation: {
      name: stayData.name,
      type: stayData.type,
      location: stayData.location,
      rating: stayData.rating,
      reviews: stayData.reviews || 48,
      price: `₹${stayData.nightlyRate.toLocaleString('en-IN')}/night`,
      pricePerNight: stayData.nightlyRate,
      totalPrice: stayData.totalCost,
      rooms: stayData.roomsRequired,
      roomLabel: stayData.roomDetails,
      nights: stayData.nights,
      amenities: stayData.amenities || ['Free Wi-Fi', 'Hot Water', 'Scenic Balcony', 'Room Service'],
      image: stayData.image,
    },
    stayDetails: {
      id: stayData.id,
      name: stayData.name,
      type: stayData.type,
      location: stayData.location,
      nightlyRate: stayData.nightlyRate,
      priceLabel: stayData.priceLabel,
      roomsRequired: stayData.roomsRequired,
      roomDetails: stayData.roomDetails,
      nights: stayData.nights,
      totalCost: stayData.totalCost,
      image: stayData.image,
      rating: stayData.rating,
      amenities: stayData.amenities,
    },

    // Transport Recommendation
    transportRecommendation: {
      method: `${selectedTransport.type} (${selectedTransport.name})`,
      type: selectedTransport.type,
      name: selectedTransport.name,
      duration: selectedTransport.durationLabel,
      durationHours: selectedTransport.durationHours,
      route: `${origin.city} ➔ ${destination.city} (${routeData.distanceKm} km)`,
      costPerPerson: `₹${selectedTransport.costPerPerson.toLocaleString('en-IN')}`,
      costPerPersonNum: selectedTransport.costPerPerson,
      totalCost: selectedTransport.totalCost || (selectedTransport.costPerPerson * totalTravelers),
      note: selectedTransport.description,
      details: selectedTransport.details,
    },
    allTransportOptions: routeData.options,

    // Local Transport Recommendation
    localTransportRecommendation: {
      mode: localTransportData.label,
      totalCost: localTransportData.totalCost,
      dailyRate: localTransportData.dailyRate,
      perPersonCost: localTransportData.perPersonCost,
      preference: localTransportData.preference,
    },

    // Food Breakdown
    foodRecommendation: foodData,

    // Structured Day-by-Day Itinerary
    dayByDay,

    // Stored User Criteria (Clean copy, never compounded!)
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
      infants,
      travelers: totalTravelers,
      userBudget: rawUserBudget,
      budget: rawUserBudget,
      budgetType,
      budgetFlexibility,
      travelStyle: criteria.travelStyle,
      accommodationPreference: 'Smart-selected within budget',
      roomsRequired: stayData.roomsRequired || null,
      intercityTransportPreference: 'Smart-selected within budget',
      localTransportPreference: 'Smart-selected within budget',
      interests: criteria.interests || [],
      activityIntensity: criteria.activityIntensity || 'Balanced',
      specialRequirements: criteria.specialRequirements || [],
    },
  };
}
