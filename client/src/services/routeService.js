import { getRoadDistanceKm, resolveLocation } from './locationService.js';

// Airports availability check
const AIRPORT_CITIES = [
  'delhi', 'new-delhi', 'mumbai', 'goa', 'dehradun', 'jaipur', 'varanasi',
  'srinagar', 'leh', 'leh-ladakh', 'bengaluru', 'bangalore', 'kolkata',
  'chennai', 'hyderabad', 'pune', 'ahmedabad', 'chandigarh', 'amritsar',
  'dharamshala', 'shillong', 'guwahati', 'bagdogra', 'udaipur', 'kochi'
];

export function calculateTransitOptions(originInput, destinationInput, travelers = 2, tripDays = 3) {
  const origin = resolveLocation(originInput);
  const destination = resolveLocation(destinationInput);
  const distanceKm = getRoadDistanceKm(origin, destination);
  const travelerCount = Math.max(1, Number(travelers) || 1);

  // Train Option
  // Avg speed 60-70 km/h for Express/Superfast
  const trainHours = Math.max(2, Math.round((distanceKm / 65) * 10) / 10);
  const trainCostPerPersonRoundTrip = Math.max(400, Math.round(distanceKm * 1.6 + 250) * 2);

  // Bus Option (Volvo / AC Sleeper)
  // Avg speed 45-50 km/h
  const busHours = Math.max(2.5, Math.round((distanceKm / 48) * 10) / 10);
  const busCostPerPersonRoundTrip = Math.max(350, Math.round(distanceKm * 1.45 + 150) * 2);

  // Car (Self-Drive / Personal Car)
  // Fuel: mileage 14 km/l @ ₹98/L -> ~₹7/km round trip
  // Tolls: approx ₹1.6/km round trip
  const carHours = Math.max(2, Math.round((distanceKm / 52) * 10) / 10);
  const roundTripKm = distanceKm * 2;
  const carFuelCost = Math.round((roundTripKm / 14) * 98);
  const carTollsCost = Math.round(roundTripKm * 1.6);
  const totalCarVehicleCost = carFuelCost + carTollsCost;
  const carCostPerPerson = Math.round(totalCarVehicleCost / travelerCount);

  // Cab (Outstation Private Taxi with Driver)
  // Approx ₹14/km + driver allowance ₹500/day
  const cabVehicleCost = Math.round(roundTripKm * 14 + tripDays * 500);
  const cabCostPerPerson = Math.round(cabVehicleCost / travelerCount);

  // Flight Option (if distance > 300km and both hubs have airport access)
  const originHasAirport = AIRPORT_CITIES.some((c) => origin.id.includes(c) || origin.city.toLowerCase().includes(c));
  const destHasAirport = AIRPORT_CITIES.some((c) => destination.id.includes(c) || destination.city.toLowerCase().includes(c));
  const flightPossible = distanceKm >= 300 && originHasAirport && destHasAirport;

  let flightCostPerPersonRoundTrip = null;
  let flightDurationHours = null;
  if (flightPossible) {
    flightDurationHours = Math.round((1.2 + distanceKm / 650 + 2.5) * 10) / 10; // includes 2.5h airport buffer
    flightCostPerPersonRoundTrip = Math.max(5500, Math.round(distanceKm * 3.8 + 2000));
  }

  const options = [
    {
      id: 'train',
      name: 'Train (Express / AC Chair Car / 3AC)',
      type: 'Train',
      durationHours: trainHours,
      durationLabel: `${Math.floor(trainHours)}h ${Math.round((trainHours % 1) * 60)}m`,
      costPerPerson: trainCostPerPersonRoundTrip,
      totalCost: trainCostPerPersonRoundTrip * travelerCount,
      description: `Scenic rail journey from ${origin.city} to ${destination.city} with reserved berths.`,
      icon: 'Train',
    },
    {
      id: 'bus',
      name: 'Bus (AC Volvo / Multi-Axle Sleeper)',
      type: 'Bus',
      durationHours: busHours,
      durationLabel: `${Math.floor(busHours)}h ${Math.round((busHours % 1) * 60)}m`,
      costPerPerson: busCostPerPersonRoundTrip,
      totalCost: busCostPerPersonRoundTrip * travelerCount,
      description: `Overnight/daytime AC Volvo coach via highway expressways.`,
      icon: 'Bus',
    },
    {
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
    },
    {
      id: 'cab',
      name: 'Private Outstation Cab / Taxi',
      type: 'Cab',
      durationHours: carHours,
      durationLabel: `${Math.floor(carHours)}h ${Math.round((carHours % 1) * 60)}m`,
      costPerPerson: cabCostPerPerson,
      totalCost: cabVehicleCost,
      description: `Door-to-door dedicated chauffeur cab for ${travelerCount} passengers.`,
      icon: 'Taxi',
    },
  ];

  if (flightPossible) {
    options.unshift({
      id: 'flight',
      name: 'Domestic Flight',
      type: 'Flight',
      durationHours: flightDurationHours,
      durationLabel: `${Math.floor(flightDurationHours)}h ${Math.round((flightDurationHours % 1) * 60)}m (incl. check-in)`,
      costPerPerson: flightCostPerPersonRoundTrip,
      totalCost: flightCostPerPersonRoundTrip * travelerCount,
      description: `Non-stop or connecting scheduled flight between commercial airports.`,
      icon: 'Plane',
    });
  }

  // Determine Cheapest and Fastest
  const cheapestOption = [...options].sort((a, b) => a.costPerPerson - b.costPerPerson)[0];
  const fastestOption = [...options].sort((a, b) => a.durationHours - b.durationHours)[0];

  return {
    origin,
    destination,
    distanceKm,
    options,
    cheapest: cheapestOption,
    fastest: fastestOption,
  };
}

export function selectPreferredTransport(routeData, preference = 'Cheapest available') {
  const prefLower = String(preference).toLowerCase();

  if (prefLower.includes('fastest')) {
    return routeData.fastest;
  }
  if (prefLower.includes('cheap')) {
    return routeData.cheapest;
  }
  if (prefLower.includes('train')) {
    return routeData.options.find((o) => o.id === 'train') || routeData.cheapest;
  }
  if (prefLower.includes('bus')) {
    return routeData.options.find((o) => o.id === 'bus') || routeData.cheapest;
  }
  if (prefLower.includes('car') || prefLower.includes('self-drive')) {
    return routeData.options.find((o) => o.id === 'car') || routeData.cheapest;
  }
  if (prefLower.includes('flight') && routeData.options.some((o) => o.id === 'flight')) {
    return routeData.options.find((o) => o.id === 'flight');
  }
  if (prefLower.includes('cab')) {
    return routeData.options.find((o) => o.id === 'cab') || routeData.cheapest;
  }

  // Default fallback
  return routeData.cheapest;
}
