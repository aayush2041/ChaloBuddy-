// Deterministic Budget Calculation and Constraint Validation Engine

export function calculateLocalTransportCost({
  preference = 'Cab',
  days = 3,
  travelers = 2,
}) {
  const pref = String(preference).toLowerCase();
  const dayCount = Math.max(1, Number(days) || 1);
  const travelerCount = Math.max(1, Number(travelers) || 1);

  let dailyRate = 900;
  let label = 'Local Cabs & Auto-rickshaws';
  let isPerPerson = false;

  if (pref.includes('bike') || pref.includes('scooter')) {
    // 1 bike per 2 travelers
    const bikes = Math.ceil(travelerCount / 2);
    dailyRate = 500 * bikes;
    label = `${bikes} Rental Scooter/Bike${bikes > 1 ? 's' : ''} (₹500/day/bike)`;
  } else if (pref.includes('rental car') || pref.includes('car')) {
    dailyRate = 1800; // car rental per day
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
    dailyRate = 350;
    isPerPerson = true;
    label = 'Mixed Transit (Shared Cabs, Autos & Walks)';
  } else {
    // Dedicated Cab
    dailyRate = 900;
    label = 'On-Demand Local Cabs & Autos (₹900/day)';
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
  transportCost,
  stayCost,
  foodCost,
  localTransportCost,
  activitiesCost,
  travelers = 2,
  userBudget = 15000,
  budgetType = 'person', // 'person' | 'total'
  budgetFlexibility = 'Moderate', // 'Strict' | 'Moderate' | 'Flexible'
}) {
  const travelerCount = Math.max(1, Number(travelers) || 1);

  // Core expenditure subtotal
  const directExpenses =
    transportCost + stayCost + foodCost + localTransportCost + activitiesCost;

  // Miscellaneous: ~4% for water, snacks, entry permits, porter tips
  const miscCost = Math.round(directExpenses * 0.04);

  // Emergency Safety Buffer: ~6% for medical, contingencies, local price variations
  const bufferCost = Math.round(directExpenses * 0.06);

  const totalCalculatedCost = directExpenses + miscCost + bufferCost;
  const perPersonCost = Math.round(totalCalculatedCost / travelerCount);

  // User Target Budget Normalization
  const rawBudget = Number(userBudget) || 15000;
  const userTotalBudget = budgetType === 'person' ? rawBudget * travelerCount : rawBudget;
  const userPerPersonBudget = Math.round(userTotalBudget / travelerCount);

  // Flexibility thresholds
  let allowedFlexibility = 0.15; // Moderate: 15%
  const flexLower = String(budgetFlexibility).toLowerCase();
  if (flexLower.includes('strict')) allowedFlexibility = 0.02; // Strict: 2%
  else if (flexLower.includes('flex')) allowedFlexibility = 0.25; // Flexible: 25%

  const maxAllowedBudget = Math.round(userTotalBudget * (1 + allowedFlexibility));
  const isOverBudget = totalCalculatedCost > maxAllowedBudget;
  const shortfallTotal = Math.max(0, totalCalculatedCost - userTotalBudget);
  const shortfallPerPerson = Math.round(shortfallTotal / travelerCount);

  const percentUsed = Math.min(100, Math.round((totalCalculatedCost / userTotalBudget) * 100));

  // Category breakdown for UI table and charts
  const breakdown = [
    {
      key: 'transport',
      category: 'Intercity Transport',
      amount: transportCost,
      perPerson: Math.round(transportCost / travelerCount),
      percentage: Math.round((transportCost / totalCalculatedCost) * 100),
      icon: 'Route',
    },
    {
      key: 'stay',
      category: 'Accommodation',
      amount: stayCost,
      perPerson: Math.round(stayCost / travelerCount),
      percentage: Math.round((stayCost / totalCalculatedCost) * 100),
      icon: 'BedDouble',
    },
    {
      key: 'food',
      category: 'Food & Meals',
      amount: foodCost,
      perPerson: Math.round(foodCost / travelerCount),
      percentage: Math.round((foodCost / totalCalculatedCost) * 100),
      icon: 'Utensils',
    },
    {
      key: 'localTransport',
      category: 'Local Commute',
      amount: localTransportCost,
      perPerson: Math.round(localTransportCost / travelerCount),
      percentage: Math.round((localTransportCost / totalCalculatedCost) * 100),
      icon: 'Car',
    },
    {
      key: 'activities',
      category: 'Activities & Entry Fees',
      amount: activitiesCost,
      perPerson: Math.round(activitiesCost / travelerCount),
      percentage: Math.round((activitiesCost / totalCalculatedCost) * 100),
      icon: 'Compass',
    },
    {
      key: 'misc',
      category: 'Miscellaneous & Snacks',
      amount: miscCost,
      perPerson: Math.round(miscCost / travelerCount),
      percentage: Math.round((miscCost / totalCalculatedCost) * 100),
      icon: 'Wallet',
    },
    {
      key: 'buffer',
      category: 'Emergency Safety Buffer',
      amount: bufferCost,
      perPerson: Math.round(bufferCost / travelerCount),
      percentage: Math.round((bufferCost / totalCalculatedCost) * 100),
      icon: 'ShieldCheck',
    },
  ];

  // Specific actionable recommendations if over budget
  const budgetWarnings = [];
  if (isOverBudget) {
    budgetWarnings.push({
      type: 'warning',
      title: 'Estimated Trip Cost Exceeds Your Target Budget',
      shortfallTotal,
      shortfallPerPerson,
      message: `Realistic estimated cost is ₹${totalCalculatedCost.toLocaleString('en-IN')} (₹${perPersonCost.toLocaleString('en-IN')}/person), while your budget is ₹${userTotalBudget.toLocaleString('en-IN')} (₹${userPerPersonBudget.toLocaleString('en-IN')}/person). Shortfall: ₹${shortfallPerPerson.toLocaleString('en-IN')}/person.`,
      suggestions: [
        'Switch to Train or Volvo Bus to save on intercity transit.',
        'Choose a Homestay or Budget Hotel instead of premium resort rooms.',
        'Consider rental bikes or public transport instead of private cabs.',
        `Increase budget to ₹${perPersonCost.toLocaleString('en-IN')}/person to keep current preferences.`,
      ],
    });
  }

  return {
    totalCost: totalCalculatedCost,
    perPersonCost,
    userTotalBudget,
    userPerPersonBudget,
    budgetType,
    budgetFlexibility,
    isOverBudget,
    shortfallTotal,
    shortfallPerPerson,
    percentUsed,
    remainingBudget: Math.max(0, userTotalBudget - totalCalculatedCost),
    breakdown,
    warnings: budgetWarnings,
  };
}
