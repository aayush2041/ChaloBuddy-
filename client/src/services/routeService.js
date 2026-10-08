import { getRoadDistanceKm, calculateHaversineDistance, resolveLocation } from './locationService.js';

// Airports availability check
const AIRPORT_CITIES = [
  'delhi', 'new-delhi', 'mumbai', 'goa', 'dehradun', 'jaipur', 'varanasi',
  'srinagar', 'leh', 'leh-ladakh', 'bengaluru', 'bangalore', 'kolkata',
  'chennai', 'hyderabad', 'pune', 'ahmedabad', 'chandigarh', 'amritsar',
  'dharamshala', 'shillong', 'guwahati', 'bagdogra', 'udaipur', 'kochi',
  'dubai', 'bangkok', 'singapore', 'london', 'paris', 'tokyo', 'kathmandu', 'colombo'
];

export function calculateTransitOptions(originInput, destinationInput, travelers = 2, tripDays = 3) {
  const origin = resolveLocation(originInput);
  const destination = resolveLocation(destinationInput);
  const travelerCount = Math.max(1, Number(travelers) || 1);

  // Check international routing
  const originCountry = (origin.country || 'India').trim().toLowerCase();
  const destCountry = (destination.country || 'India').trim().toLowerCase();
  const isInternational = originCountry !== destCountry && destCountry !== 'india';

  const haversineDist = calculateHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  const distanceKm = isInternational ? haversineDist : getRoadDistanceKm(origin, destination);

  const options = [];

  if (isInternational || distanceKm > 2200) {
    // 1. INTERNATIONAL DESTINATION OR LONG-HAUL OVERSEAS
    // Commercial flight is the only realistic transit
    let flightHours = Math.round((distanceKm / 750 + 3.0) * 10) / 10; // includes 3h airport buffer
    let economyRoundTrip = 22000;
    let flightType = 'International Flight (Economy)';

    if (distanceKm <= 3500) {
      // Short-haul international (Dubai, Bangkok, Singapore, Kathmandu, Colombo)
      economyRoundTrip = Math.max(16000, Math.round(distanceKm * 5.2 + 4000));
      flightHours = Math.max(4, Math.round((distanceKm / 700 + 2.5) * 10) / 10);
    } else {
      // Long-haul international (Europe, UK, Americas, East Asia)
      economyRoundTrip = Math.max(45000, Math.round(distanceKm * 6.5 + 8000));
      flightHours = Math.max(8, Math.round((distanceKm / 800 + 3.5) * 10) / 10);
    }

    options.push({
      id: 'flight-economy',
      name: `${flightType} to ${destination.city}`,
      type: 'Flight',
      durationHours: flightHours,
      durationLabel: `${Math.floor(flightHours)}h ${Math.round((flightHours % 1) * 60)}m (incl. transit)`,
      costPerPerson: economyRoundTrip,
      totalCost: economyRoundTrip * travelerCount,
      description: `Scheduled international flight between international airports.`,
      icon: 'Plane',
      isEstimate: true,
    });

    options.push({
      id: 'flight-direct',
      name: `Direct / Flexible Flight to ${destination.city}`,
      type: 'Flight',
      durationHours: Math.max(3.5, flightHours - 1.5),
      durationLabel: `${Math.floor(Math.max(3.5, flightHours - 1.5))}h ${Math.round(((flightHours - 1.5) % 1) * 60)}m`,
      costPerPerson: Math.round(economyRoundTrip * 1.35),
      totalCost: Math.round(economyRoundTrip * 1.35) * travelerCount,
      description: `Preferred non-stop scheduled international flight.`,
      icon: 'Plane',
      isEstimate: true,
    });
  } else {
    // 2. DOMESTIC ROUTING WITHIN INDIA
    // Train Option (Express / AC Chair Car / 3AC)
    const trainHours = Math.max(2, Math.round((distanceKm / 65) * 10) / 10);
    const trainCostPerPersonRoundTrip = Math.max(400, Math.round(distanceKm * 1.55 + 200) * 2);

    options.push({
      id: 'train',
      name: distanceKm > 500 ? 'Train (3AC / Superfast Express)' : 'Train (Express / AC Chair Car)',
      type: 'Train',
      durationHours: trainHours,
      durationLabel: `${Math.floor(trainHours)}h ${Math.round((trainHours % 1) * 60)}m`,
      costPerPerson: trainCostPerPersonRoundTrip,
      totalCost: trainCostPerPersonRoundTrip * travelerCount,
      description: `Comfortable rail journey from ${origin.city} to ${destination.city} with reserved berths.`,
      icon: 'Train',
      isEstimate: true,
    });

    // Bus Option (AC Volvo / Multi-Axle Sleeper)
    if (distanceKm <= 1200) {
      const busHours = Math.max(2.5, Math.round((distanceKm / 48) * 10) / 10);
      const busCostPerPersonRoundTrip = Math.max(350, Math.round(distanceKm * 1.4 + 150) * 2);

      options.push({
        id: 'bus',
        name: 'AC Volvo / Sleeper Coach Bus',
        type: 'Bus',
        durationHours: busHours,
        durationLabel: `${Math.floor(busHours)}h ${Math.round((busHours % 1) * 60)}m`,
        costPerPerson: busCostPerPersonRoundTrip,
        totalCost: busCostPerPersonRoundTrip * travelerCount,
        description: `Overnight or daytime AC Volvo coach via highway expressways.`,
        icon: 'Bus',
        isEstimate: true,
      });
    }

    // Car (Self-Drive / Personal Car)
    if (distanceKm <= 800) {
      const carHours = Math.max(2, Math.round((distanceKm / 52) * 10) / 10);
      const roundTripKm = distanceKm * 2;
      const carFuelCost = Math.round((roundTripKm / 14) * 98);
      const carTollsCost = Math.round(roundTripKm * 1.6);
      const totalCarVehicleCost = carFuelCost + carTollsCost;
      const carCostPerPerson = Math.round(totalCarVehicleCost / travelerCount);

      options.push({
        id: 'car',
        name: 'Personal Car / Self-Drive',
        type: 'Car',
        durationHours: carHours,
        durationLabel: `${Math.floor(carHours)}h ${Math.round((carHours % 1) * 60)}m`,
        costPerPerson: carCostPerPerson,
        totalCost: totalCarVehicleCost,
        breakdown: { fuel: carFuelCost, tolls: carTollsCost },
        description: `Flexible highway road trip. Estimated fuel: ₹${carFuelCost.toLocaleString('en-IN')}, Tolls: ₹${carTollsCost.toLocaleString('en-IN')}.`,
        icon: 'Car',
        isEstimate: true,
      });
    }

    // Cab (Outstation Private Taxi with Chauffeur)
    if (distanceKm <= 700) {
      const cabHours = Math.max(2, Math.round((distanceKm / 52) * 10) / 10);
      const roundTripKm = distanceKm * 2;
      const cabVehicleCost = Math.round(roundTripKm * 13 + tripDays * 500);
      const cabCostPerPerson = Math.round(cabVehicleCost / travelerCount);

      options.push({
        id: 'cab',
        name: 'Private Outstation Cab / Taxi',
        type: 'Cab',
        durationHours: cabHours,
        durationLabel: `${Math.floor(cabHours)}h ${Math.round((cabHours % 1) * 60)}m`,
        costPerPerson: cabCostPerPerson,
        totalCost: cabVehicleCost,
        description: `Door-to-door dedicated chauffeur cab for ${travelerCount} passengers.`,
        icon: 'Taxi',
        isEstimate: true,
      });
    }

    // Domestic Flight Option
    const originHasAirport = AIRPORT_CITIES.some((c) => origin.id?.includes(c) || origin.city?.toLowerCase().includes(c));
    const destHasAirport = AIRPORT_CITIES.some((c) => destination.id?.includes(c) || destination.city?.toLowerCase().includes(c));
    if (distanceKm >= 350 && (originHasAirport || destHasAirport || distanceKm >= 600)) {
      const flightDurationHours = Math.round((1.2 + distanceKm / 650 + 2.5) * 10) / 10;
      const flightCostPerPersonRoundTrip = Math.max(4800, Math.round(distanceKm * 3.4 + 1800));

      options.push({
        id: 'flight',
        name: 'Domestic Flight',
        type: 'Flight',
        durationHours: flightDurationHours,
        durationLabel: `${Math.floor(flightDurationHours)}h ${Math.round((flightDurationHours % 1) * 60)}m (incl. check-in)`,
        costPerPerson: flightCostPerPersonRoundTrip,
        totalCost: flightCostPerPersonRoundTrip * travelerCount,
        description: `Scheduled commercial flight between regional airports.`,
        icon: 'Plane',
        isEstimate: true,
      });
    }
  }

  // Fallback safety if options is empty
  if (options.length === 0) {
    const fallbackCost = Math.max(1200, Math.round(distanceKm * 2.5));
    options.push({
      id: 'transit-default',
      name: 'Intercity Transport (Train / Bus)',
      type: 'Train',
      durationHours: 6,
      durationLabel: '6h 00m',
      costPerPerson: fallbackCost,
      totalCost: fallbackCost * travelerCount,
      description: `Standard intercity travel from ${origin.city} to ${destination.city}.`,
      icon: 'Train',
      isEstimate: true,
    });
  }

  const cheapestOption = [...options].sort((a, b) => a.costPerPerson - b.costPerPerson)[0];
  const fastestOption = [...options].sort((a, b) => a.durationHours - b.durationHours)[0];

  return {
    origin,
    destination,
    distanceKm,
    isInternational,
    options,
    cheapest: cheapestOption,
    fastest: fastestOption,
  };
}

export function selectPreferredTransport(routeData, preference = 'Cheapest available') {
  if (!routeData?.options?.length) return null;
  const prefLower = String(preference || '').toLowerCase();

  if (prefLower.includes('fastest')) return routeData.fastest;
  if (prefLower.includes('cheap')) return routeData.cheapest;
  if (prefLower.includes('train')) return routeData.options.find((o) => o.type === 'Train') || routeData.cheapest;
  if (prefLower.includes('bus')) return routeData.options.find((o) => o.type === 'Bus') || routeData.cheapest;
  if (prefLower.includes('car')) return routeData.options.find((o) => o.type === 'Car') || routeData.cheapest;
  if (prefLower.includes('flight')) return routeData.options.find((o) => o.type === 'Flight') || routeData.cheapest;
  if (prefLower.includes('cab')) return routeData.options.find((o) => o.type === 'Cab') || routeData.cheapest;

  return routeData.cheapest;
}
