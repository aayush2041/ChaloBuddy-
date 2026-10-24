// Live destination discovery helpers used by Smart Planner.
// Integrates Transport Hubs (Airports, Railway Stations, Bus Terminals, Ferry Ports)
// Open-Meteo geocoding for worldwide city/place lookup.
// Wikipedia geosearch for real nearby landmarks.

import { findTransportHubs } from '../data/transportHubsData.js';

export async function geocodeLocation(query) {
  const q = String(query || '').trim();
  if (!q) throw new Error('Location is required');

  // Check transport hubs first
  const matchingHubs = findTransportHubs(q, 1);
  if (matchingHubs.length > 0) {
    return {
      ...matchingHubs[0],
      source: 'hub',
    };
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`);

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];
  if (!results.length) throw new Error(`Location not found: ${q}`);

  const r = results[0];
  return {
    id: `geo-${r.id}`,
    placeId: String(r.id),
    placeName: r.name,
    city: r.name,
    state: r.admin1 || r.admin2 || r.country || '',
    country: r.country || '',
    countryCode: r.country_code || '',
    fullName: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    type: r.feature_code || 'City',
    lat: Number(r.latitude),
    lng: Number(r.longitude),
    timezone: r.timezone || null,
    population: r.population || null,
    source: 'geocoding',
  };
}

export async function searchLocations(query, limit = 8) {
  const q = String(query || '').trim();
  if (q.length < 2) return [];

  // 1. Check local Transport Hubs (Airports, Railway Stations, Bus Stations, Ferries)
  const hubs = findTransportHubs(q, 4).map((h) => ({
    ...h,
    source: 'hub',
  }));

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=${Math.min(10, Math.max(1, limit))}&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) return hubs;
    const data = await response.json();

    const geoResults = (data.results || []).map((r) => ({
      id: `geo-${r.id}`,
      placeId: String(r.id),
      placeName: r.name,
      city: r.name,
      state: r.admin1 || r.admin2 || r.country || '',
      country: r.country || '',
      countryCode: r.country_code || '',
      fullName: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
      type: r.feature_code || 'City',
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      timezone: r.timezone || null,
      population: r.population || null,
      source: 'geocoding',
    }));

    return [...hubs, ...geoResults].slice(0, limit);
  } catch {
    return hubs;
  }
}

export async function discoverDestinationAttractions(location, limit = 10) {
  if (!location?.lat || !location?.lng) return [];

  try {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggsprimary=all&ggsnamespace=0&ggsradius=30000&ggslimit=${Math.min(20, Math.max(1, limit))}&ggscoord=${location.lat}%7C${location.lng}&prop=extracts%7Cpageimages%7Ccoordinates&exintro=1&explaintext=1&exchars=420&piprop=thumbnail&pithumbsize=500&format=json&origin=*`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    return Object.values(data.query?.pages || {})
      .filter((p) => p?.title)
      .map((p) => ({
        id: `wiki-${p.pageid}`,
        title: p.title,
        desc: p.extract || `Visit ${p.title} and explore this local landmark.`,
        image: p.thumbnail?.source || null,
        lat: p.coordinates?.[0]?.lat || null,
        lng: p.coordinates?.[0]?.lon || null,
        source: 'Wikipedia',
        url: p.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`,
      }))
      .slice(0, limit);
  } catch {
    return [];
  }
}
