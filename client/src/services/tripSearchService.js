/**
 * Trip Search & Filtering Service
 * Reliable querying of real trip catalog with location, date, and passenger matching.
 */

/**
 * Extracts or resolves the starting location for a trip.
 */
export function getTripStartingLocation(trip) {
  if (!trip) return 'Delhi';
  if (trip.startingLocation) return trip.startingLocation;
  if (trip.origin) {
    return typeof trip.origin === 'object'
      ? (trip.origin.city || trip.origin.fullName || 'Delhi')
      : String(trip.origin);
  }
  if (trip.meetingPoint) {
    const mp = String(trip.meetingPoint).toLowerCase();
    if (mp.includes('delhi')) return 'Delhi, NCT of Delhi';
    if (mp.includes('dehradun')) return 'Dehradun, Uttarakhand';
    if (mp.includes('guwahati')) return 'Guwahati, Assam';
    if (mp.includes('goa')) return 'Goa';
    if (mp.includes('jasidih') || mp.includes('deoghar')) return 'Deoghar, Jharkhand';
    if (mp.includes('mumbai')) return 'Mumbai, Maharashtra';
    if (mp.includes('bangalore') || mp.includes('bengaluru')) return 'Bengaluru, Karnataka';
    return trip.meetingPoint.split('(')[0].trim();
  }
  return 'Delhi';
}

/**
 * Normalizes location strings for flexible matching (e.g. "Delhi, India" matches "Delhi").
 */
function normalizeLocationString(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Checks if search location matches trip location.
 */
function locationMatches(searchLoc, targetLoc) {
  if (!searchLoc || !searchLoc.trim()) return true;
  if (!targetLoc) return false;

  const searchNorm = normalizeLocationString(searchLoc);
  const targetNorm = normalizeLocationString(targetLoc);

  if (targetNorm.includes(searchNorm) || searchNorm.includes(targetNorm)) {
    return true;
  }

  // Token-based matching (e.g., "Manali" in "Manali, Himachal Pradesh")
  const searchTokens = searchNorm.split(/\s+/).filter((t) => t.length > 2);
  if (searchTokens.length === 0) return true;

  return searchTokens.some((token) => targetNorm.includes(token));
}

/**
 * Checks if a trip date matches the requested search date.
 */
function dateMatches(searchDate, trip) {
  if (!searchDate) return true;

  // Search date can be a Date object or formatted string (e.g. "15 Oct 2026")
  let targetSearchTime = null;
  if (searchDate instanceof Date && !isNaN(searchDate.getTime())) {
    targetSearchTime = new Date(searchDate).setHours(0, 0, 0, 0);
  } else if (typeof searchDate === 'string' && searchDate.trim()) {
    const parsed = new Date(searchDate);
    if (!isNaN(parsed.getTime())) {
      targetSearchTime = parsed.setHours(0, 0, 0, 0);
    }
  }

  if (!targetSearchTime) return true;

  // Compare against trip.startDate
  if (trip.startDate) {
    const tripStartTime = new Date(trip.startDate).setHours(0, 0, 0, 0);
    if (!isNaN(tripStartTime)) {
      // Allow trips departing on or up to 30 days after the selected date
      const thirtyDaysLater = targetSearchTime + 30 * 24 * 60 * 60 * 1000;
      return tripStartTime >= targetSearchTime && tripStartTime <= thirtyDaysLater;
    }
  }

  // Fallback text check against trip.dates (e.g., month/year match)
  if (typeof searchDate === 'string' && trip.dates) {
    const monthYear = searchDate.split(' ').slice(1).join(' ').toLowerCase();
    if (monthYear && trip.dates.toLowerCase().includes(monthYear)) {
      return true;
    }
  }

  return true;
}

/**
 * Executes trip search against real catalog with validation and error handling.
 */
export async function executeTripSearch(allTrips, criteria = {}) {
  const {
    from = '',
    destination = '',
    date = null,
    travelers = 1,
  } = criteria;

  try {
    const list = Array.isArray(allTrips) ? allTrips : [];
    const validTravelers = Math.max(1, Math.min(12, Number(travelers) || 1));

    const results = list.filter((trip) => {
      // 1. From / Starting Location filter
      const tripStarting = getTripStartingLocation(trip);
      const matchesFrom = locationMatches(from, tripStarting) ||
        locationMatches(from, trip.meetingPoint);
      if (!matchesFrom) return false;

      // 2. Destination filter
      const matchesDest = locationMatches(destination, trip.destination) ||
        locationMatches(destination, trip.title) ||
        locationMatches(destination, trip.state) ||
        locationMatches(destination, trip.region);
      if (!matchesDest) return false;

      // 3. Passenger / Available Seats filter
      const availableSeats = Number(trip.spotsLeft ?? (trip.maxGroupSize - (trip.currentGroupSize || 0)) ?? 4);
      if (availableSeats < validTravelers) return false;

      // 4. Date filter
      if (!dateMatches(date, trip)) return false;

      return true;
    });

    return {
      success: true,
      results,
      totalFound: results.length,
      criteria: {
        from: from.trim(),
        destination: destination.trim(),
        date,
        travelers: validTravelers,
      },
    };
  } catch (err) {
    console.error('Trip search technical execution error:', err);
    throw new Error('We could not load trips at this moment. Please check your search parameters and try again.');
  }
}
