// Deterministic Budget Calculation and Constraint Validation Engine
// Follows strict 6-category allocation:
// 1. Transportation
// 2. Accommodation
// 3. Food
// 4. Local transport
// 5. Activities
// 6. Miscellaneous
// ----------------
// TOTAL (mathematically exact sum of the 6 components)

export function calculateLocalTransportCost({
  preference = 'Mixed',
  days = 3,
  travelers = 2,
  isInternational = false,
}) {
  const pref = String(preference).toLowerCase();
  const dayCount = Math.max(1, Number(days) || 1);
  const travelerCount = Math.max(1, Number(travelers) || 1);

  let dailyRate = 700;
  let label = 'Local Cabs & Auto-rickshaws';
  let isPerPerson = false;

  if (isInternational) {
    if (pref.includes('public') || pref.includes('metro') || pref.includes('bus')) {
      dailyRate = 600;
      isPerPerson = true;
      label = 'Metro & City Transit Day Passes (₹600/person/day)';
    } else {
      dailyRate = 1200;
      isPerPerson = true;
      label = 'City Metro + Rideshare & Taxis (₹1,200/person/day)';
    }
  } else {
    if (pref.includes('bike') || pref.includes('scooter')) {
      const bikes = Math.ceil(travelerCount / 2);
      dailyRate = 450 * bikes;
      label = `${bikes} Rental Scooter/Bike${bikes > 1 ? 's' : ''} (₹450/day/bike)`;
    } else if (pref.includes('rental car') || pref.includes('car')) {
      dailyRate = 1800;
      label = 'Local Self-Drive Car Rental (₹1,800/day)';
    } else if (pref.includes('public transport') || pref.includes('metro') || pref.includes('bus')) {
      dailyRate = 150;
      isPerPerson = true;
      label = 'Public Transport & City Bus Passes (₹150/person/day)';
    } else if (pref.includes('walk')) {
      dailyRate = 80;
      isPerPerson = true;
      label = 'Walking + Short Auto Hops (₹80/person/day)';
    } else if (pref.includes('mixed')) {
      dailyRate = 300;
      isPerPerson = true;
      label = 'Mixed Transit (Shared Cabs, Autos & Short Walks)';
    } else {
      // Dedicated Cab
      dailyRate = 850;
      label = 'On-Demand Local Cabs & Autos (₹850/day)';
    }
  }

  const totalCost = isPerPerson
    ? Math.round(dailyRate * travelerCount * dayCount)
    : Math.round(dailyRate * dayCount);

  return {
    preference,
    label,
    dailyRate,
    isPerPerson,
    totalCost,
    perPersonCost: Math.round(totalCost / travelerCount),
  };
}

export function buildCompleteBudget({
  transportCost = 0,
  stayCost = 0,
  foodCost = 0,
  localTransportCost = 0,
  activitiesCost = 0,
  miscCost = null,
  travelers = 2,
  userBudget = 15000,
  budgetType = 'total', // 'total' is default source of truth
}) {
  const travelerCount = Math.max(1, Number(travelers) || 1);

  // 1. Direct Core Expenses
  const tCost = Math.round(Number(transportCost) || 0);
  const sCost = Math.round(Number(stayCost) || 0);
  const fCost = Math.round(Number(foodCost) || 0);
  const lCost = Math.round(Number(localTransportCost) || 0);
  const aCost = Math.round(Number(activitiesCost) || 0);

  // 2. Miscellaneous Expenses (bottled water, entry permits, light snacks, tips)
  // ~4% of direct expenses or minimum ₹150/person/day
  const subtotal = tCost + sCost + fCost + lCost + aCost;
  const computedMisc = miscCost !== null
    ? Math.round(Number(miscCost) || 0)
    : Math.max(200, Math.round(subtotal * 0.04));

  // 3. Mathematically Exact Total:
  // TOTAL = Transportation + Accommodation + Food + Local transport + Activities + Miscellaneous
  const totalCalculatedCost = tCost + sCost + fCost + lCost + aCost + computedMisc;
  const perPersonCost = Math.round(totalCalculatedCost / travelerCount);

  // 4. User Target Budget Normalization
  const rawBudget = Math.round(Number(userBudget) || 15000);
  const userTotalBudget = budgetType === 'person' ? rawBudget * travelerCount : rawBudget;
  const userPerPersonBudget = Math.round(userTotalBudget / travelerCount);

  // 5. Budget Status: User entered budget is the source of truth!
  const isOverBudget = totalCalculatedCost > userTotalBudget;
  const shortfallTotal = Math.max(0, totalCalculatedCost - userTotalBudget);
  const shortfallPerPerson = Math.round(shortfallTotal / travelerCount);
  const remainingBudget = Math.max(0, userTotalBudget - totalCalculatedCost);
  const percentUsed = userTotalBudget > 0 ? Math.round((totalCalculatedCost / userTotalBudget) * 100) : 100;

  // 6. Strict 6-Category Breakdown
  const breakdown = [
    {
      key: 'transport',
      category: 'Transportation',
      label: 'Intercity Transport',
      amount: tCost,
      perPerson: Math.round(tCost / travelerCount),
      percentage: totalCalculatedCost > 0 ? Math.round((tCost / totalCalculatedCost) * 100) : 0,
      icon: 'Route',
    },
    {
      key: 'stay',
      category: 'Accommodation',
      label: 'Hotel / Homestay / Resort',
      amount: sCost,
      perPerson: Math.round(sCost / travelerCount),
      percentage: totalCalculatedCost > 0 ? Math.round((sCost / totalCalculatedCost) * 100) : 0,
      icon: 'BedDouble',
    },
    {
      key: 'food',
      category: 'Food',
      label: 'Daily Breakfast, Lunch & Dinner',
      amount: fCost,
      perPerson: Math.round(fCost / travelerCount),
      percentage: totalCalculatedCost > 0 ? Math.round((fCost / totalCalculatedCost) * 100) : 0,
      icon: 'Utensils',
    },
    {
      key: 'localTransport',
      category: 'Local transport',
      label: 'Local Commute & Transfers',
      amount: lCost,
      perPerson: Math.round(lCost / travelerCount),
      percentage: totalCalculatedCost > 0 ? Math.round((lCost / totalCalculatedCost) * 100) : 0,
      icon: 'Car',
    },
    {
      key: 'activities',
      category: 'Activities',
      label: 'Sightseeing & Entry Passes',
      amount: aCost,
      perPerson: Math.round(aCost / travelerCount),
      percentage: totalCalculatedCost > 0 ? Math.round((aCost / totalCalculatedCost) * 100) : 0,
      icon: 'Compass',
    },
    {
      key: 'misc',
      category: 'Miscellaneous',
      label: 'Water, Snacks & Contingency',
      amount: computedMisc,
      perPerson: Math.round(computedMisc / travelerCount),
      percentage: totalCalculatedCost > 0 ? Math.round((computedMisc / totalCalculatedCost) * 100) : 0,
      icon: 'Wallet',
    },
  ];

  // Specific actionable recommendations if over budget
  const warnings = [];
  if (isOverBudget) {
    warnings.push({
      type: 'warning',
      title: 'Trip is unlikely to fit within budget',
      shortfallTotal,
      shortfallPerPerson,
      message: `This trip is unlikely to fit within ₹${userTotalBudget.toLocaleString('en-IN')} for ${travelerCount} ${travelerCount === 1 ? 'person' : 'people'}.`,
      suggestions: [
        'Reduce number of days to cut accommodation and daily meal costs.',
        `Increase budget to at least ₹${totalCalculatedCost.toLocaleString('en-IN')} to cover realistic expenses.`,
        'Choose cheaper transport (e.g. Sleeper Train or AC Bus instead of Flights/Private Cabs).',
        'Choose cheaper accommodation (e.g. Hostels or Budget Homestays instead of Hotels).',
      ],
    });
  }

  return {
    transportCost: tCost,
    stayCost: sCost,
    foodCost: fCost,
    localTransportCost: lCost,
    activitiesCost: aCost,
    miscCost: computedMisc,
    totalCost: totalCalculatedCost,
    perPersonCost,
    userTotalBudget,
    userPerPersonBudget,
    budgetType,
    isOverBudget,
    shortfallTotal,
    shortfallPerPerson,
    remainingBudget,
    percentUsed,
    breakdown,
    warnings,
  };
}
