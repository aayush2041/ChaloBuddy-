// Weather Estimation Service based on geographic region and travel month

export function getEstimatedWeather(destination, dateStr) {
  const destName = typeof destination === 'object' ? destination.city : String(destination || '');
  const dLower = destName.toLowerCase();

  // Extract month
  let month = 9; // Default October (0-indexed: 9)
  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      month = parsed.getMonth();
    }
  }

  const isWinter = month === 11 || month === 0 || month === 1; // Dec, Jan, Feb
  const isSummer = month >= 3 && month <= 5; // Apr, May, Jun
  const isMonsoon = month >= 6 && month <= 8; // Jul, Aug, Sep
  const isAutumnSpring = !isWinter && !isSummer && !isMonsoon; // Mar, Oct, Nov

  if (dLower.includes('manali') || dLower.includes('spiti') || dLower.includes('ladakh') || dLower.includes('kedarkantha')) {
    if (isWinter) {
      return { temp: '-6°C – 4°C', condition: 'Snowfall & Crisp High-Altitude Chill', summary: 'Sub-zero temperatures; heavy snow gear required.' };
    }
    if (isSummer) {
      return { temp: '10°C – 22°C', condition: 'Pleasant Alpine Sunshine', summary: 'Cool mountain breeze, clear valley visibility.' };
    }
    if (isMonsoon) {
      return { temp: '12°C – 20°C', condition: 'Mountain Showers & Misty Ridges', summary: 'Lush green valleys with intermittent rain.' };
    }
    return { temp: '4°C – 16°C', condition: 'Crisp Golden Autumn Sun', summary: 'Clear blue skies with chilly evenings.' };
  }

  if (dLower.includes('dehradun') || dLower.includes('rishikesh') || dLower.includes('mussoorie') || dLower.includes('nainital')) {
    if (isWinter) {
      return { temp: '6°C – 18°C', condition: 'Chilly Mornings & Clear Alpine Sun', summary: 'Cool winter breeze; warm jacket recommended for evenings.' };
    }
    if (isSummer) {
      return { temp: '20°C – 32°C', condition: 'Warm Foothills Sunshine', summary: 'Pleasant weather compared to the northern plains.' };
    }
    if (isMonsoon) {
      return { temp: '21°C – 28°C', condition: 'Monsoon Showers & Gushing Cascades', summary: 'Rich green flora and scenic cloud cover.' };
    }
    return { temp: '14°C – 24°C', condition: 'Fresh Mountain Breeze & Clear Skies', summary: 'Ideal sightseeing climate with comfortable temperatures.' };
  }

  if (dLower.includes('goa') || dLower.includes('daman') || dLower.includes('pondicherry') || dLower.includes('mumbai') || dLower.includes('kerala') || dLower.includes('kochi')) {
    if (isMonsoon) {
      return { temp: '24°C – 29°C', condition: 'Tropical Downpours & Lush Coastline', summary: 'Dramatic ocean swells and waterfalls at full flow.' };
    }
    if (isSummer) {
      return { temp: '28°C – 35°C', condition: 'Warm Tropical Beach Sun', summary: 'Bright sunny days for coastal dips and water sports.' };
    }
    return { temp: '22°C – 31°C', condition: 'Balmy Coastal Breeze & Sunshine', summary: 'Peak beach weather with gentle sea breezes.' };
  }

  if (dLower.includes('jaipur') || dLower.includes('udaipur') || dLower.includes('jodhpur') || dLower.includes('jaisalmer')) {
    if (isWinter) {
      return { temp: '10°C – 24°C', condition: 'Crisp Desert Winter Sunshine', summary: 'Perfect heritage walking weather; light shawl for evenings.' };
    }
    if (isSummer) {
      return { temp: '28°C – 41°C', condition: 'Hot Arid Sun', summary: 'Sunny days; indoor sightseeing recommended in afternoon.' };
    }
    return { temp: '18°C – 32°C', condition: 'Pleasant Desert Breeze', summary: 'Comfortable conditions for fort explorations and lake sunsets.' };
  }

  if (dLower.includes('delhi')) {
    if (isWinter) {
      return { temp: '7°C – 20°C', condition: 'Cool Winter Sun & Morning Mist', summary: 'Chilly mornings warming into pleasant sunny afternoons.' };
    }
    if (isSummer) {
      return { temp: '29°C – 40°C', condition: 'Bright Summer Sun', summary: 'High daytime temperatures; early morning / evening explorations best.' };
    }
    return { temp: '18°C – 29°C', condition: 'Pleasant Autumn Sun & Clear Skies', summary: 'Excellent heritage walking weather.' };
  }

  // Standard India fallback
  return { temp: '18°C – 28°C', condition: 'Pleasant Weather & Clear Skies', summary: 'Comfortable temperatures suitable for outdoor exploration.' };
}

export function getDestinationWeather(destination, dateStrOrMonth) {
  let dateStr = dateStrOrMonth;
  if (typeof dateStrOrMonth === 'number') {
    dateStr = `2026-${String(dateStrOrMonth).padStart(2, '0')}-15`;
  }
  const result = getEstimatedWeather(destination, dateStr);
  return {
    ...result,
    tempRange: result.temp,
  };
}
