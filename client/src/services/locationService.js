import { DESTINATIONS_DATABASE } from '../data/destinationsData.js';

// Haversine Great-Circle Distance in Kilometers
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 300; // default reasonable estimate if coordinates missing
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Realistic Road Distance factor (approx 1.20 - 1.30x straight line in Indian terrain)
export function getRoadDistanceKm(origin, destination) {
  const o = resolveLocation(origin);
  const d = resolveLocation(destination);

  // Exact known intercity road distances for high accuracy
  const knownPairs = {
    'delhi-dehradun': 248,
    'dehradun-delhi': 248,
    'new-delhi-dehradun': 248,
    'delhi-manali': 535,
    'new-delhi-manali': 535,
    'delhi-spiti-valley': 710,
    'delhi-goa': 1880,
    'mumbai-goa': 590,
    'mumbai-manali': 1930,
    'delhi-jaipur': 275,
    'delhi-rishikesh': 238,
    'delhi-kasol': 515,
    'delhi-jibhi': 495,
    'delhi-deoghar': 1220,
    'delhi-varanasi': 820,
    'delhi-udaipur': 660,
    'bengaluru-goa': 560,
    'bengaluru-coorg': 250,
    'bengaluru-ooty': 275,
    'kolkata-darjeeling': 615,
    'kolkata-deoghar': 325,
    'mumbai-pune': 150,
  };

  const pairKey1 = `${o.id}-${d.id}`;
  const pairKey2 = `${o.city.toLowerCase()}-${d.city.toLowerCase()}`;
  if (knownPairs[pairKey1]) return knownPairs[pairKey1];
  if (knownPairs[pairKey2]) return knownPairs[pairKey2];

  const straightDist = calculateHaversineDistance(o.lat, o.lng, d.lat, d.lng);
  if (straightDist === 0) return 0;
  // Road terrain factor: mountainous terrain ~1.35x, plains ~1.22x
  const isMountainous =
    (d.state && (d.state.includes('Himachal') || d.state.includes('Uttarakhand') || d.state.includes('Ladakh'))) ||
    (o.state && (o.state.includes('Himachal') || o.state.includes('Uttarakhand')));
  const factor = isMountainous ? 1.35 : 1.22;
  return Math.round(straightDist * factor);
}

// Resolve location string or partial object into full structured location
export function resolveLocation(input) {
  if (!input) {
    return {
      id: 'delhi',
      city: 'Delhi',
      state: 'NCT of Delhi',
      country: 'India',
      fullName: 'Delhi, NCT of Delhi, India',
      type: 'Metropolis & Capital Hub',
      lat: 28.6139,
      lng: 77.209,
    };
  }

  // If already a valid structured location object with valid finite coordinates
  if (
    typeof input === 'object' &&
    (input.city || input.placeName) &&
    input.lat !== undefined &&
    input.lat !== null &&
    !input.unresolved &&
    Number.isFinite(Number(input.lat)) &&
    Number.isFinite(Number(input.lng))
  ) {
    return {
      id: input.id || (input.city || input.placeName).toLowerCase().replace(/\s+/g, '-'),
      city: input.city || input.placeName,
      state: input.state || 'India',
      country: input.country || 'India',
      fullName: input.fullName || [input.city || input.placeName, input.state, input.country].filter(Boolean).join(', '),
      type: input.type || 'Travel Destination',
      lat: Number(input.lat),
      lng: Number(input.lng),
      placeId: input.placeId || input.id,
    };
  }

  // Extract clean search query from string or partial object
  let query = '';
  if (typeof input === 'string') {
    query = input.trim();
  } else if (typeof input === 'object') {
    query = (input.id || input.city || input.placeName || input.fullName || '').trim();
  }

  const queryLower = query.toLowerCase();

  // Try exact or partial match in curated destinations database
  const match = DESTINATIONS_DATABASE.find(
    (d) =>
      d.id === queryLower ||
      d.city.toLowerCase() === queryLower ||
      d.fullName.toLowerCase().includes(queryLower) ||
      (queryLower.length > 2 && queryLower.includes(d.city.toLowerCase()))
  );

  if (match) {
    return { ...match };
  }

  // Common transport hub aliases with accurate coordinates
  const commonCities = {
    mumbai: { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
    bengaluru: { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    bangalore: { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    kolkata: { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    chennai: { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    hyderabad: { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
    pune: { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    ahmedabad: { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    chandigarh: { city: 'Chandigarh', state: 'Punjab / Haryana', lat: 30.7333, lng: 76.7794 },
    lucknow: { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  };

  const fallbackCity = commonCities[queryLower];
  if (fallbackCity) {
    return {
      id: queryLower,
      city: fallbackCity.city,
      state: fallbackCity.state,
      country: 'India',
      fullName: `${fallbackCity.city}, ${fallbackCity.state}, India`,
      type: 'Major Transport & Urban Hub',
      lat: fallbackCity.lat,
      lng: fallbackCity.lng,
    };
  }

  // For places not found locally, preserve the name cleanly without fabricating coordinates.
  const firstWord = query.split(',')[0].trim();
  const capitalized = firstWord ? firstWord.charAt(0).toUpperCase() + firstWord.slice(1) : 'Unknown';

  return {
    id: firstWord.toLowerCase().replace(/\s+/g, '-'),
    city: typeof input === 'object' && input.city ? input.city : capitalized,
    state: typeof input === 'object' && input.state ? input.state : '',
    country: typeof input === 'object' && input.country ? input.country : '',
    fullName: typeof input === 'object' && input.fullName ? input.fullName : query,
    type: 'Unresolved Location',
    lat: null,
    lng: null,
    unresolved: true,
  };
}
