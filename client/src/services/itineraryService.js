// Detailed Day-by-Day Itinerary Scheduler with Realistic Timelines, Travel Buffers & Meals

export function generateDailyItinerary({
  origin,
  destination,
  days = 3,
  dates = null,
  dayPlans = [],
  transportOption,
  stay,
  food,
}) {
  const dayCount = Math.max(1, Number(days) || 1);
  const transitHours = transportOption?.durationHours || 4;

  const itinerary = [];

  for (let d = 1; d <= dayCount; d++) {
    const isFirstDay = d === 1;
    const isLastDay = d === dayCount;
    const dayPlan = dayPlans[d - 1] || { neighborhood: 'Local Area', activities: [] };
    const activities = dayPlan.activities || [];

    const schedule = [];

    if (isFirstDay) {
      // DAY 1: Transit & Check-in
      const departHour = 7; // 07:00 AM
      const arriveHour = Math.min(13, Math.round(departHour + transitHours));
      const arrivePeriod = arriveHour >= 12 ? 'PM' : 'AM';
      const arriveFormatted = `${arriveHour > 12 ? arriveHour - 12 : arriveHour}:00 ${arrivePeriod}`;

      schedule.push({
        id: `d${d}-act-1`,
        time: '07:00 AM',
        title: `Depart ${origin.city} via ${transportOption.type}`,
        desc: `Board ${transportOption.name}. Travel duration approximately ${transportOption.durationLabel}.`,
        travelTime: transportOption.durationLabel,
        estimatedCost: transportOption.costPerPerson,
        isMeal: false,
        category: 'Transport',
      });

      schedule.push({
        id: `d${d}-act-2`,
        time: arriveFormatted,
        title: `Arrive in ${destination.city} & Check-in at ${stay.name}`,
        desc: `Settle in at ${stay.location}, unpack and freshen up. Welcome drinks provided.`,
        travelTime: '30 mins transfer',
        estimatedCost: 0,
        isMeal: false,
        category: 'Stay',
      });

      schedule.push({
        id: `d${d}-meal-1`,
        time: '01:30 PM',
        title: `Welcome Regional Lunch`,
        desc: `Taste authentic local dishes and specialties near ${stay.location}.`,
        travelTime: '10 mins walk',
        estimatedCost: food.breakdown.lunch,
        isMeal: true,
        category: 'Food',
      });

      // Afternoon activities from cluster
      let actTime = 3; // 03:00 PM
      activities.slice(0, 2).forEach((act, idx) => {
        schedule.push({
          id: `d${d}-act-${idx + 3}`,
          time: `0${actTime}:00 PM`,
          title: act.title,
          desc: `${act.desc} (Area: ${act.neighborhood || dayPlan.neighborhood}).`,
          travelTime: '20 mins local transit',
          estimatedCost: act.costPerPerson || 0,
          isMeal: false,
          category: act.category,
        });
        actTime += 2;
      });

      schedule.push({
        id: `d${d}-meal-2`,
        time: '08:00 PM',
        title: `Dinner & Evening Leisure`,
        desc: `Relax with local delicacies and enjoy quiet mountain or city nightlife.`,
        travelTime: '15 mins transfer',
        estimatedCost: food.breakdown.dinner,
        isMeal: true,
        category: 'Food',
      });
    } else if (isLastDay) {
      // FINAL DAY: Morning visit, Souvenir shopping & Return
      schedule.push({
        id: `d${d}-meal-1`,
        time: '08:30 AM',
        title: `Breakfast at ${stay.name}`,
        desc: `Hearty complimentary breakfast buffet before checkout.`,
        travelTime: 'On-site',
        estimatedCost: food.breakdown.breakfast,
        isMeal: true,
        category: 'Food',
      });

      schedule.push({
        id: `d${d}-act-1`,
        time: '10:00 AM',
        title: `Hotel Checkout & Luggage Drop`,
        desc: `Complete checkout at ${stay.name}. Concierge holds luggage during final sightseeing.`,
        travelTime: '15 mins',
        estimatedCost: 0,
        isMeal: false,
        category: 'Stay',
      });

      // 1 or 2 final activities
      if (activities.length > 0) {
        schedule.push({
          id: `d${d}-act-2`,
          time: '10:45 AM',
          title: activities[0].title,
          desc: activities[0].desc,
          travelTime: '20 mins travel',
          estimatedCost: activities[0].costPerPerson || 0,
          isMeal: false,
          category: activities[0].category,
        });
      }

      schedule.push({
        id: `d${d}-meal-2`,
        time: '01:00 PM',
        title: `Farewell Lunch & Souvenir Shopping`,
        desc: `Enjoy regional cuisine and pick up local handicrafts, spices, and souvenirs.`,
        travelTime: '15 mins walk',
        estimatedCost: food.breakdown.lunch,
        isMeal: true,
        category: 'Food',
      });

      schedule.push({
        id: `d${d}-act-3`,
        time: '03:30 PM',
        title: `Depart ${destination.city} for Return Journey to ${origin.city}`,
        desc: `Board ${transportOption.name} for the return trip home.`,
        travelTime: transportOption.durationLabel,
        estimatedCost: 0,
        isMeal: false,
        category: 'Transport',
      });
    } else {
      // INTERMEDIATE DAYS
      schedule.push({
        id: `d${d}-meal-1`,
        time: '08:30 AM',
        title: `Breakfast at ${stay.name}`,
        desc: `Energizing morning meal before starting full-day explorations.`,
        travelTime: 'On-site',
        estimatedCost: food.breakdown.breakfast,
        isMeal: true,
        category: 'Food',
      });

      let currentHour = 9; // 09:30 AM
      activities.slice(0, 3).forEach((act, idx) => {
        const isPM = currentHour >= 12;
        const displayH = currentHour > 12 ? currentHour - 12 : currentHour;
        const timeStr = `${displayH < 10 ? '0' : ''}${displayH}:30 ${isPM ? 'PM' : 'AM'}`;

        schedule.push({
          id: `d${d}-act-${idx + 1}`,
          time: timeStr,
          title: act.title,
          desc: `${act.desc} (Neighborhood: ${act.neighborhood || dayPlan.neighborhood}).`,
          travelTime: '25 mins local transit',
          estimatedCost: act.costPerPerson || 0,
          isMeal: false,
          category: act.category,
        });

        currentHour += 2;

        if (idx === 0) {
          // Lunch after first morning exploration
          schedule.push({
            id: `d${d}-meal-lunch`,
            time: '01:30 PM',
            title: `Lunch at Scenic Regional Cafe`,
            desc: `Enjoy freshly prepared lunch near ${act.neighborhood || dayPlan.neighborhood}.`,
            travelTime: '15 mins travel',
            estimatedCost: food.breakdown.lunch,
            isMeal: true,
            category: 'Food',
          });
          currentHour = 15; // 03:00 PM
        }
      });

      schedule.push({
        id: `d${d}-meal-dinner`,
        time: '08:00 PM',
        title: `Dinner & Evening Gathering`,
        desc: `Savor evening specialities and relax after a fulfilling day.`,
        travelTime: '20 mins travel',
        estimatedCost: food.breakdown.dinner,
        isMeal: true,
        category: 'Food',
      });
    }

    const dayTotalActivityCost = schedule.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

    itinerary.push({
      day: d,
      title: isFirstDay
        ? `Day 1: Arrival, Check-in & ${dayPlan.neighborhood} Explorations`
        : isLastDay
        ? `Day ${d}: Morning Highlights, Artisan Crafts & Return to ${origin.city}`
        : `Day ${d}: ${dayPlan.neighborhood} Deep Dive & Scenic Trails`,
      neighborhood: dayPlan.neighborhood,
      totalDayCostPerPerson: dayTotalActivityCost,
      activities: schedule,
    });
  }

  return itinerary;
}
