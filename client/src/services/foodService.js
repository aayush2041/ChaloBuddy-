// Realistic Daily Food Budget Calculation

export function calculateFoodBudget({
  travelers = 2,
  days = 3,
  travelStyle = 'Comfortable',
  interests = [],
  requirements = [],
}) {
  const travelerCount = Math.max(1, Number(travelers) || 1);
  const dayCount = Math.max(1, Number(days) || 1);
  const style = String(travelStyle).toLowerCase();
  const isFoodie = interests.some((i) => String(i).toLowerCase().includes('food') || String(i).toLowerCase().includes('cafe'));

  let breakfast = 150;
  let lunch = 300;
  let dinner = 350;

  if (style.includes('budget') || style.includes('backpack')) {
    breakfast = 100;
    lunch = 150;
    dinner = 200;
  } else if (style.includes('luxury')) {
    breakfast = 450;
    lunch = 900;
    dinner = 1150;
  } else if (style.includes('premium')) {
    breakfast = 250;
    lunch = 500;
    dinner = 650;
  }

  // Foodie interest bonus for artisan cafes / fine regional dinners
  if (isFoodie) {
    lunch += 50;
    dinner += 100;
  }

  const dailyPerPerson = breakfast + lunch + dinner;
  const totalFoodCost = dailyPerPerson * travelerCount * dayCount;

  return {
    dailyPerPerson,
    breakdown: {
      breakfast,
      lunch,
      dinner,
    },
    days: dayCount,
    travelers: travelerCount,
    totalCost: totalFoodCost,
    description: `₹${dailyPerPerson.toLocaleString('en-IN')}/person/day (Breakfast: ₹${breakfast}, Lunch: ₹${lunch}, Dinner: ₹${dinner})`,
  };
}
