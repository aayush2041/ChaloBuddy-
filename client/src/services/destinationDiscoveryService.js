// Live destination discovery helpers used by Smart Planner.
// Open-Meteo geocoding is used for worldwide city/place lookup without an API key.
// Wikipedia geosearch supplies real nearby landmarks instead of invented attractions.

export async function geocodeLocation(query) {
  const q = String(query || '').trim();
  if (!q) throw new Error('Location is required');

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
    type: r.feature_code || 'Place',
    lat: Number(r.latitude),
    lng: Number(r.longitude),
    timezone: r.timezone || null,
    population: r.population || null,
  };
}

export async function searchLocations(query, limit = 8) {
  const q = String(query || '').trim();
  if (q.length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=${Math.min(10, Math.max(1, limit))}&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();

    return (data.results || []).map((r) => ({
      id: `geo-${r.id}`,
      placeId: String(r.id),
      placeName: r.name,
      city: r.name,
      state: r.admin1 || r.admin2 || r.country || '',
      country: r.country || '',
      countryCode: r.country_code || '',
      fullName: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
      type: r.feature_code || 'Place',
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      timezone: r.timezone || null,
      population: r.population || null,
      source: 'geocoding',
    }));
  } catch {
    return [];
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
