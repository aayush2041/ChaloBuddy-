import { INITIAL_STAYS } from '../data/seedData.js';
import { resolveLocation } from './locationService.js';

export function calculateStayOptions({
  destination,
  travelers = 2,
  adults = 2,
  nights = 2,
  accommodationPreference = 'Hotel',
  travelStyle = 'Comfortable',
  roomsRequired = null,
}) {
  const dest = resolveLocation(destination);
  const totalNights = Math.max(1, Number(nights) || 1);
  const adultCount = Math.max(1, Number(adults) || Number(travelers) || 2);
  const totalTravelers = Math.max(1, Number(travelers) || adultCount);

  // Calculate rooms required: 2 adults per room realistically
  const isHostel =
    String(accommodationPreference).toLowerCase().includes('hostel') ||
    String(travelStyle).toLowerCase().includes('backpack');

  const calculatedRooms = isHostel
    ? 1
    : roomsRequired && Number(roomsRequired) > 0
    ? Number(roomsRequired)
    : Math.max(1, Math.ceil(adultCount / 2));

  // Determine base nightly rate per room/bed
  const pref = String(accommodationPreference).toLowerCase();
  let baseNightlyRate = 3200;
  let stayTypeLabel = 'Boutique Hotel';

  if (pref.includes('hostel')) {
    baseNightlyRate = 650; // per bed
    stayTypeLabel = 'Social Mountain/City Hostel (Dorm Bed)';
  } else if (pref.includes('budget hotel') || pref.includes('budget')) {
    baseNightlyRate = 1600;
    stayTypeLabel = 'Cozy Budget Hotel';
  } else if (pref.includes('homestay')) {
    baseNightlyRate = 2400;
    stayTypeLabel = 'Authentic Local Homestay';
  } else if (pref.includes('resort')) {
    baseNightlyRate = 5800;
    stayTypeLabel = 'Eco-Luxury Nature Resort';
  } else if (pref.includes('premium')) {
    baseNightlyRate = 8500;
    stayTypeLabel = '4★ / 5★ Premium Hotel & Spa';
  } else {
    // No preference: infer from travel style
    const style = String(travelStyle).toLowerCase();
    if (style.includes('budget') || style.includes('backpack')) {
      baseNightlyRate = 1600;
      stayTypeLabel = 'Budget Accommodations';
    } else if (style.includes('luxury') || style.includes('premium')) {
      baseNightlyRate = 7500;
      stayTypeLabel = 'Luxury Boutique Retreat';
    } else {
      baseNightlyRate = 3200;
      stayTypeLabel = 'Comfortable Hotel';
    }
  }

  // Check if we have an authentic stay in INITIAL_STAYS for this city
  const cityKey = dest.city.toLowerCase();
  const matchedStay = INITIAL_STAYS.find((s) => {
    const loc = (s.location || '').toLowerCase();
    const name = (s.name || '').toLowerCase();
    return loc.includes(cityKey) || name.includes(cityKey);
  });

  const stayName = matchedStay
    ? matchedStay.name
    : `${dest.city} ${stayTypeLabel.split(' ')[0]} Retreat`;

  const nightlyRate = matchedStay && matchedStay.pricePerNight ? matchedStay.pricePerNight : baseNightlyRate;

  // Calculate total stay cost
  // If hostel, rate is per traveler; if hotel/resort/homestay, rate is per room
  const totalStayCost = isHostel
    ? nightlyRate * totalTravelers * totalNights
    : nightlyRate * calculatedRooms * totalNights;

  const stayImage = matchedStay?.images?.[0] ||
    (dest.city.toLowerCase().includes('manali')
      ? 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'
      : dest.city.toLowerCase().includes('goa')
      ? 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'
      : dest.city.toLowerCase().includes('dehradun')
      ? 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80');

  return {
    id: matchedStay?.id || `stay-${dest.id}-recommended`,
    name: stayName,
    type: stayTypeLabel,
    location: matchedStay?.location || `${dest.city}, ${dest.state}`,
    nightlyRate,
    priceLabel: `₹${nightlyRate.toLocaleString('en-IN')} / ${isHostel ? 'person' : 'room'} / night`,
    roomsRequired: calculatedRooms,
    roomDetails: isHostel
      ? `${totalTravelers} Reserved Dorm Bunk${totalTravelers > 1 ? 's' : ''}`
      : `${calculatedRooms} Room${calculatedRooms > 1 ? 's' : ''} (${Math.round(totalTravelers / calculatedRooms)} guests/room)`,
    nights: totalNights,
    totalCost: totalStayCost,
    image: stayImage,
    rating: matchedStay?.rating || 4.8,
    amenities: matchedStay?.amenities || [
      'High-Speed Wi-Fi',
      'Mountain/City View Balcony',
      'Hot Water 24/7',
      'Complimentary Breakfast',
      'On-site Cafe',
    ],
  };
}
