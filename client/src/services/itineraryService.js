// Detailed Day-by-Day Itinerary Scheduler with Morning, Afternoon & Evening Windows
// Geographically Clustered by Neighborhood to Prevent Zig-zag Travel

export function generateDailyItinerary({
  origin,
  destination,
  days = 3,
  dates = null,
  dayPlans = [],
  transportOption,
  stay,
  food,
  localTransport,
}) {
  const dayCount = Math.max(1, Number(days) || 1);
  const transitHours = transportOption?.durationHours || 4;
  const dailyLocalTravelCost = Math.round((localTransport?.perPersonCost || 250));
  const dailyFoodCost = Math.round(
    (food?.breakdown?.breakfast || 150) +
    (food?.breakdown?.lunch || 300) +
    (food?.breakdown?.dinner || 350)
  );

  const itinerary = [];

  for (let d = 1; d <= dayCount; d++) {
    const isFirstDay = d === 1;
    const isLastDay = d === dayCount;
    const dayPlan = dayPlans[d - 1] || { neighborhood: `${destination.city} Central`, activities: [] };
    const rawActs = Array.isArray(dayPlan.activities) ? dayPlan.activities : [];

    const schedule = [];
    let morningBlock = null;
    let afternoonBlock = null;
    let eveningBlock = null;

    if (isFirstDay) {
      // DAY 1: Transit, Check-in & Area Orientation
      const arriveHour = Math.min(13, Math.max(11, Math.round(7 + transitHours)));
      const arriveFormatted = `${arriveHour > 12 ? arriveHour - 12 : arriveHour}:00 ${arriveHour >= 12 ? 'PM' : 'AM'}`;

      const departItem = {
        id: `d${d}-act-depart`,
        time: '07:00 AM',
        title: `Depart ${origin.city} via ${transportOption.type}`,
        desc: `Board ${transportOption.name}. Travel duration approximately ${transportOption.durationLabel}.`,
        travelTime: transportOption.durationLabel,
        estimatedCost: transportOption.costPerPerson,
        category: 'Transport',
        isMeal: false,
      };

      const checkInItem = {
        id: `d${d}-act-checkin`,
        time: arriveFormatted,
        title: `Arrive in ${destination.city} & Check-in at ${stay.name}`,
        desc: `Settle in at ${stay.location}, unpack and freshen up.`,
        travelTime: '30 mins local transfer',
        estimatedCost: 0,
        category: 'Accommodation',
        isMeal: false,
      };

      const lunchItem = {
        id: `d${d}-meal-lunch`,
        time: '01:30 PM',
        title: `Welcome Regional Lunch`,
        desc: `Sample authentic local specialties at a traditional eatery near ${stay.location}.`,
        travelTime: '10 mins walk',
        estimatedCost: food?.breakdown?.lunch || 300,
        category: 'Food',
        isMeal: true,
      };

      const afternoonAct = rawActs[0] || {
        title: `${dayPlan.neighborhood} Promenade & Local Market`,
        desc: `Leisurely walking exploration of ${dayPlan.neighborhood} bazaars, viewpoints, and landmarks.`,
        costPerPerson: 0,
      };

      const explorationItem = {
        id: `d${d}-act-afternoon`,
        time: '03:30 PM',
        title: afternoonAct.title,
        desc: `${afternoonAct.desc} (Cluster: ${dayPlan.neighborhood}).`,
        travelTime: '15 mins local hop',
        estimatedCost: afternoonAct.costPerPerson || 0,
        category: 'Sightseeing',
        isMeal: false,
      };

      const dinnerItem = {
        id: `d${d}-meal-dinner`,
        time: '08:00 PM',
        title: `Dinner & Evening Stroll`,
        desc: `Evening dinner featuring local regional specialties and lively local ambiance.`,
        travelTime: '15 mins walk',
        estimatedCost: food?.breakdown?.dinner || 350,
        category: 'Food',
        isMeal: true,
      };

      schedule.push(departItem, checkInItem, lunchItem, explorationItem, dinnerItem);

      morningBlock = {
        time: '07:00 AM – 12:30 PM',
        title: `Intercity Transit to ${destination.city}`,
        description: `Board ${transportOption.name} from ${origin.city}. Arrive in ${destination.city} and check in at ${stay.name}.`,
        items: [departItem, checkInItem],
      };

      afternoonBlock = {
        time: '01:00 PM – 05:00 PM',
        title: `Lunch & ${dayPlan.neighborhood} Sightseeing`,
        description: `Enjoy local cuisine, followed by exploring ${afternoonAct.title} without backtracking.`,
        items: [lunchItem, explorationItem],
      };

      eveningBlock = {
        time: '05:30 PM – 09:30 PM',
        title: 'Sunset Views & Dinner',
        description: `Evening unwind at ${stay.location} with local dinner and tranquil night atmosphere.`,
        items: [dinnerItem],
      };
    } else if (isLastDay) {
      // FINAL DAY: Morning Highlights, Souvenir Shopping & Departure
      const breakfastItem = {
        id: `d${d}-meal-breakfast`,
        time: '08:30 AM',
        title: `Breakfast at ${stay.name}`,
        desc: `Complimentary breakfast before packing and completing checkout.`,
        travelTime: 'On-site',
        estimatedCost: food?.breakdown?.breakfast || 150,
        category: 'Food',
        isMeal: true,
      };

      const checkoutItem = {
        id: `d${d}-act-checkout`,
        time: '10:00 AM',
        title: `Checkout & Concierge Luggage Drop`,
        desc: `Check out of ${stay.name}. Front desk securely stores bags during final stops.`,
        travelTime: '15 mins',
        estimatedCost: 0,
        category: 'Accommodation',
        isMeal: false,
      };

      const morningAct = rawActs[0] || {
        title: `${destination.city} Heritage & Handicraft Center`,
        desc: `Visit local craft workshops and scenic panorama points.`,
        costPerPerson: 0,
      };

      const finalSightItem = {
        id: `d${d}-act-sight`,
        time: '10:45 AM',
        title: morningAct.title,
        desc: `${morningAct.desc} (Area: ${dayPlan.neighborhood}).`,
        travelTime: '20 mins transit',
        estimatedCost: morningAct.costPerPerson || 0,
        category: 'Sightseeing',
        isMeal: false,
      };

      const farewellLunchItem = {
        id: `d${d}-meal-farewell`,
        time: '01:00 PM',
        title: `Farewell Lunch & Souvenir Shopping`,
        desc: `Pick up famous regional teas, spices, dry fruits, or artisan souvenirs.`,
        travelTime: '10 mins walk',
        estimatedCost: food?.breakdown?.lunch || 300,
        category: 'Food',
        isMeal: true,
      };

      const returnTransitItem = {
        id: `d${d}-act-return`,
        time: '04:00 PM',
        title: `Board Return Transit to ${origin.city}`,
        desc: `Collect luggage and begin journey back to ${origin.city} via ${transportOption.type}.`,
        travelTime: transportOption.durationLabel,
        estimatedCost: 0, // Included in round-trip ticket
        category: 'Transport',
        isMeal: false,
      };

      schedule.push(breakfastItem, checkoutItem, finalSightItem, farewellLunchItem, returnTransitItem);

      morningBlock = {
        time: '08:30 AM – 12:30 PM',
        title: 'Checkout & Final Neighborhood Highlights',
        description: `Breakfast, checkout at ${stay.name}, and morning exploration of ${morningAct.title}.`,
        items: [breakfastItem, checkoutItem, finalSightItem],
      };

      afternoonBlock = {
        time: '01:00 PM – 04:00 PM',
        title: 'Farewell Lunch & Souvenir Collection',
        description: `Regional farewell lunch and local craft/spice shopping.`,
        items: [farewellLunchItem],
      };

      eveningBlock = {
        time: '04:00 PM – 10:00 PM',
        title: `Return Journey to ${origin.city}`,
        description: `Scenic return travel to ${origin.city}.`,
        items: [returnTransitItem],
      };
    } else {
      // INTERMEDIATE FULL EXPLORATION DAYS
      const breakfastItem = {
        id: `d${d}-meal-breakfast`,
        time: '08:30 AM',
        title: `Breakfast at ${stay.name}`,
        desc: `Energizing morning breakfast to fuel the day's neighborhood trail.`,
        travelTime: 'On-site',
        estimatedCost: food?.breakdown?.breakfast || 150,
        category: 'Food',
        isMeal: true,
      };

      const morningSight = rawActs[0] || {
        title: `${dayPlan.neighborhood} Nature Trail & Panorama View`,
        desc: `Scenic morning walk and scenic viewing gallery in ${dayPlan.neighborhood}.`,
        costPerPerson: 50,
      };

      const morningSightItem = {
        id: `d${d}-act-morning`,
        time: '09:45 AM',
        title: morningSight.title,
        desc: `${morningSight.desc} (Area: ${dayPlan.neighborhood}).`,
        travelTime: '20 mins local hop',
        estimatedCost: morningSight.costPerPerson || 0,
        category: 'Sightseeing',
        isMeal: false,
      };

      const lunchItem = {
        id: `d${d}-meal-lunch`,
        time: '01:15 PM',
        title: `Lunch at Traditional Regional Cafe`,
        desc: `Delicious hot lunch near ${dayPlan.neighborhood} attractions.`,
        travelTime: '10 mins walk',
        estimatedCost: food?.breakdown?.lunch || 300,
        category: 'Food',
        isMeal: true,
      };

      const afternoonSight = rawActs[1] || {
        title: `${dayPlan.neighborhood} Cultural Landmark & Temple / Abbey`,
        desc: `Architectural and cultural highlights of the neighborhood.`,
        costPerPerson: 0,
      };

      const afternoonSightItem = {
        id: `d${d}-act-afternoon`,
        time: '03:15 PM',
        title: afternoonSight.title,
        desc: `${afternoonSight.desc} (Within same cluster: ${dayPlan.neighborhood}).`,
        travelTime: '15 mins walk/auto',
        estimatedCost: afternoonSight.costPerPerson || 0,
        category: 'Sightseeing',
        isMeal: false,
      };

      const eveningSight = rawActs[2] || {
        title: `Sunset Point & Vibrant Local Promenade`,
        desc: `Golden hour viewpoint followed by evening street cafes and artisan stalls.`,
        costPerPerson: 0,
      };

      const eveningSightItem = {
        id: `d${d}-act-evening`,
        time: '05:45 PM',
        title: eveningSight.title,
        desc: `${eveningSight.desc} (Area: ${dayPlan.neighborhood}).`,
        travelTime: '15 mins transit',
        estimatedCost: eveningSight.costPerPerson || 0,
        category: 'Sightseeing',
        isMeal: false,
      };

      const dinnerItem = {
        id: `d${d}-meal-dinner`,
        time: '08:15 PM',
        title: `Dinner & Evening Gathering`,
        desc: `Enjoy freshly prepared dinner, ambient music, and star-lit night skies.`,
        travelTime: '15 mins return',
        estimatedCost: food?.breakdown?.dinner || 350,
        category: 'Food',
        isMeal: true,
      };

      schedule.push(breakfastItem, morningSightItem, lunchItem, afternoonSightItem, eveningSightItem, dinnerItem);

      morningBlock = {
        time: '08:30 AM – 12:30 PM',
        title: `Morning Highlights in ${dayPlan.neighborhood}`,
        description: `Breakfast at stay followed by visit to ${morningSight.title}.`,
        items: [breakfastItem, morningSightItem],
      };

      afternoonBlock = {
        time: '01:00 PM – 05:00 PM',
        title: `Lunch & ${afternoonSight.title}`,
        description: `Regional cafe lunch followed by afternoon exploration of ${afternoonSight.title} in the same area cluster.`,
        items: [lunchItem, afternoonSightItem],
      };

      eveningBlock = {
        time: '05:30 PM – 09:30 PM',
        title: `Sunset at ${eveningSight.title} & Dinner`,
        description: `Golden-hour views at ${eveningSight.title} and dinner near ${stay.name}.`,
        items: [eveningSightItem, dinnerItem],
      };
    }

    itinerary.push({
      day: d,
      title: isFirstDay
        ? `Day 1: Arrival & ${dayPlan.neighborhood} Welcome Trail`
        : isLastDay
        ? `Day ${d}: Farewell Highlights & Departure to ${origin.city}`
        : `Day ${d}: In-Depth Explorations in ${dayPlan.neighborhood}`,
      neighborhood: dayPlan.neighborhood,
      morning: morningBlock,
      afternoon: afternoonBlock,
      evening: eveningBlock,
      activities: schedule,
      estimatedLocalTravel: {
        costPerPerson: dailyLocalTravelCost,
        mode: localTransport?.label || 'Local Autos & Shared Cabs',
      },
      estimatedFood: {
        costPerPerson: dailyFoodCost,
        note: 'Breakfast, Lunch & Dinner at verified regional cafes',
      },
      accommodation: {
        name: stay.name,
        type: stay.type,
        location: stay.location,
        note: isLastDay ? 'Late checkout / luggage storage' : `Overnight stay at ${stay.name}`,
      },
      totalDayCostPerPerson: schedule.reduce((sum, s) => sum + (s.estimatedCost || 0), 0),
    });
  }

  return itinerary;
}
