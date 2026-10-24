import prisma from '../server/db.js';
import { hashPassword } from '../server/auth.js';

async function seed() {
  console.log('🌱 Seeding production-quality relational data for ChaloBuddy...');

  const passwordHash = await hashPassword('ChaloBuddy@2026');

  // 1. Seed Core Users & Profiles
  const usersData = [
    {
      email: 'priya@chalobuddy.com',
      name: 'Priya Patel',
      gender: 'FEMALE',
      role: 'HOST',
      isVerified: true,
      bio: 'Expedition lead & slow travel advocate. 7+ years hosting all-women and community treks across Western Ghats and Himachal.',
      city: 'Mumbai, Maharashtra',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      travelStyle: 'ADVENTURE',
      languages: 'English, Hindi, Gujarati',
      interests: 'Coastal Treks, Yoga Retreats, Photography, Cafes',
    },
    {
      email: 'ananya@chalobuddy.com',
      name: 'Ananya Sen',
      gender: 'FEMALE',
      role: 'HOST',
      isVerified: true,
      bio: 'Solo backpacker, documentary maker and motorcycle tourer. Passionate about women empowerment in outdoor adventure sports.',
      city: 'Kolkata & Leh',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      travelStyle: 'BACKPACKING',
      languages: 'English, Bengali, Hindi',
      interests: 'High Altitude Trails, Monasteries, Campfires, Folk Art',
    },
    {
      email: 'aarav@chalobuddy.com',
      name: 'Aarav Sharma',
      gender: 'MALE',
      role: 'HOST',
      isVerified: true,
      bio: 'Wilderness first-responder & Himalayan route scout. Led over 35 expeditions across Spiti, Zanskar, and Uttarakhand.',
      city: 'Delhi & Manali',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      travelStyle: 'ADVENTURE',
      languages: 'Hindi, English, Pahari',
      interests: 'Trekking, Astrophotography, High Passes, Camping',
    },
    {
      email: 'rohan@chalobuddy.com',
      name: 'Rohan Verma',
      gender: 'MALE',
      role: 'TRAVELER',
      isVerified: true,
      bio: 'Product engineer & spontaneous road-tripper. Always eager to explore mountain villages and offbeat hill trails.',
      city: 'Bangalore, Karnataka',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      travelStyle: 'RELAXED',
      languages: 'English, Hindi, Kannada',
      interests: 'Road Trips, Cafes, Motorcycling, Stargazing',
    },
    {
      email: 'demo@chalobuddy.com',
      name: 'Riya Mehta',
      gender: 'FEMALE',
      role: 'TRAVELER',
      isVerified: true,
      bio: 'Architecture student & heritage enthusiast. Eager to connect with fellow women travelers for safe, enriching cultural explorations.',
      city: 'Pune, Maharashtra',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      travelStyle: 'CULTURAL',
      languages: 'English, Hindi, Marathi',
      interests: 'Heritage Architecture, Local Markets, Hiking, Food Walks',
    },
  ];

  const userMap = new Map();

  for (const u of usersData) {
    const upserted = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        gender: u.gender,
        role: u.role,
        isVerified: u.isVerified,
        Profile: {
          create: {
            id: `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            avatarUrl: u.avatarUrl,
            bio: u.bio,
            city: u.city,
            travelStyle: u.travelStyle,
            companionRating: 4.9,
            tripsCompleted: 8,
            gender: u.gender,
            languages: u.languages,
            interests: u.interests,
            budgetMin: 5000,
            budgetMax: 25000,
          },
        },
        Verification: {
          create: {
            id: `verif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            verified: true,
            verifiedAt: new Date(),
          },
        },
      },
      update: {
        name: u.name,
        gender: u.gender,
        role: u.role,
        isVerified: u.isVerified,
        Profile: {
          upsert: {
            create: {
              id: `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              avatarUrl: u.avatarUrl,
              bio: u.bio,
              city: u.city,
              travelStyle: u.travelStyle,
              companionRating: 4.9,
              tripsCompleted: 8,
              gender: u.gender,
              languages: u.languages,
              interests: u.interests,
              budgetMin: 5000,
              budgetMax: 25000,
            },
            update: {
              avatarUrl: u.avatarUrl,
              bio: u.bio,
              city: u.city,
              travelStyle: u.travelStyle,
              gender: u.gender,
              languages: u.languages,
              interests: u.interests,
            },
          },
        },
      },
    });

    userMap.set(u.email, upserted);
  }
  console.log(`✅ Upserted ${usersData.length} core users & verified profiles.`);

  const priyaUser = userMap.get('priya@chalobuddy.com');
  const ananyaUser = userMap.get('ananya@chalobuddy.com');
  const aaravUser = userMap.get('aarav@chalobuddy.com');
  const rohanUser = userMap.get('rohan@chalobuddy.com');
  const demoUser = userMap.get('demo@chalobuddy.com');

  // 2. Seed Real Trips
  const tripsData = [
    {
      id: 'trip_women_gokarna',
      creatorId: priyaUser.id,
      title: 'Gokarna & Dandeli Women-Only Coastal Retreat',
      startingCity: 'Bangalore, Karnataka',
      destination: 'Gokarna, Karnataka',
      startDate: new Date(Date.now() + 10 * 86400000),
      endDate: new Date(Date.now() + 14 * 86400000),
      budgetMin: 8500,
      budgetMax: 12500,
      groupSize: 8,
      description: 'An exclusive, supportive women-only journey blending Kudle beach cliff walks, secret cave temples, Kali River rafting in Dandeli, and cliffside sunset yoga. All accommodation vetted for female traveler safety with private beach cottages and verified transfers.',
      included: 'Private AC Mini-Coach, 4 Nights Beach Cottages (Twin Share), Kali River Rafting, Daily Breakfast & Dinner, Certified Female Lead',
      excluded: 'Personal gear, Lunch cafes, Scuba add-on',
      transport: 'BUS',
      accommodation: 'HOMESTAY',
      travelStyle: 'RELAXED',
      intensity: 'EASY',
      status: 'PUBLISHED',
      isWomenOnly: true,
      visibility: 'WOMEN_ONLY',
      currency: 'INR',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      stops: 'Bangalore -> Hubli -> Dandeli -> Gokarna',
      guidelines: 'Exclusively open to female travelers. Verified profile required. Zero alcohol during adventure activities. Respectful community ethos.',
    },
    {
      id: 'trip_women_ladakh',
      creatorId: ananyaUser.id,
      title: 'Ladakh High Passes & Monasteries (Women Explorer Squad)',
      startingCity: 'Delhi',
      destination: 'Leh Ladakh',
      startDate: new Date(Date.now() + 25 * 86400000),
      endDate: new Date(Date.now() + 32 * 86400000),
      budgetMin: 22000,
      budgetMax: 29000,
      groupSize: 10,
      description: 'Conquer Khardung La (17,982 ft), camp beside the surreal turquoise expanse of Pangong Tso, and experience Hemis monastery chanting with an all-women group of intrepid adventurers. Includes dedicated oxygen backup, medical acclimatization days, and female mountain logistics.',
      included: 'In-Ladakh 4x4 Transit, 7 Nights Boutique Stays & Heated Dome Tents, Inner Line Permits, Oxygen Concentrators, Breakfast & Dinner',
      excluded: 'Flights to/from Leh, Lunch, Personal trekking poles',
      transport: 'CAR',
      accommodation: 'HOTEL',
      travelStyle: 'ADVENTURE',
      intensity: 'HIGH',
      status: 'PUBLISHED',
      isWomenOnly: true,
      visibility: 'WOMEN_ONLY',
      currency: 'INR',
      coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      stops: 'Leh -> Sham Valley -> Nubra Valley -> Pangong Tso -> Leh',
      guidelines: 'Strictly women-only. Must undergo acclimatization protocol in Leh for first 48 hours. Doctor clearance recommended for high altitude.',
    },
    {
      id: 'trip_spiti_expedition',
      creatorId: aaravUser.id,
      title: 'Spiti Valley High Passes & Chandratal Expedition',
      startingCity: 'Delhi',
      destination: 'Spiti Valley, Himachal Pradesh',
      startDate: new Date(Date.now() + 15 * 86400000),
      endDate: new Date(Date.now() + 23 * 86400000),
      budgetMin: 14500,
      budgetMax: 18500,
      groupSize: 12,
      description: 'The definitive Trans-Himalayan overland adventure through Kinnaur, Nako, Tabo monastery, highest post office at Hikkim, and starry night camping at Chandratal Lake.',
      included: 'Tempo Traveler transit Delhi-to-Delhi, 8 Nights Homestays & Swiss Tents, Breakfast & Dinner, Green Cess Permits, Wilderness Lead',
      excluded: 'Lunches, personal cafe bills, monastery entry tickets',
      transport: 'CAR',
      accommodation: 'HOMESTAY',
      travelStyle: 'ADVENTURE',
      intensity: 'HIGH',
      status: 'PUBLISHED',
      isWomenOnly: false,
      visibility: 'PUBLIC',
      currency: 'INR',
      coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      stops: 'Delhi -> Shimla -> Kalpa -> Tabo -> Kaza -> Chandratal -> Manali -> Delhi',
      guidelines: 'Open to all adventure enthusiasts. High fitness level recommended for Kunzum Pass.',
    },
    {
      id: 'trip_coorg_trails',
      creatorId: rohanUser.id,
      title: 'Coorg Coffee Plantations & Tadiandamol Trek',
      startingCity: 'Bangalore, Karnataka',
      destination: 'Coorg, Karnataka',
      startDate: new Date(Date.now() + 7 * 86400000),
      endDate: new Date(Date.now() + 10 * 86400000),
      budgetMin: 5500,
      budgetMax: 7800,
      groupSize: 8,
      description: 'Lush misty hills, estate walks through blooming arabica coffee, authentic Kodava cuisine, and hiking to the highest peak in Coorg.',
      included: 'Shared Outstation Cab, 3 Nights Heritage Estate Homestay, Guided Trek, Campfire, All Breakfasts',
      excluded: 'Personal shopping, Highway meals',
      transport: 'CAR',
      accommodation: 'HOMESTAY',
      travelStyle: 'NATURE',
      intensity: 'MODERATE',
      status: 'PUBLISHED',
      isWomenOnly: false,
      visibility: 'PUBLIC',
      currency: 'INR',
      coverImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
      stops: 'Bangalore -> Mysore -> Madikeri -> Tadiandamol',
      guidelines: 'Eco-conscious travelers only. Leave no trace policy on the mountain trail.',
    },
  ];

  for (const t of tripsData) {
    const trip = await prisma.trip.upsert({
      where: { id: t.id },
      create: t,
      update: t,
    });

    let conv = await prisma.conversation.findFirst({
      where: { tripId: trip.id },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          id: `conv_${trip.id}`,
          tripId: trip.id,
          title: `${trip.title} • Private Group Chat`,
          type: 'TRIP_GROUP',
        },
      });
    }

    await prisma.conversationParticipant.upsert({
      where: {
        conversationId_userId: {
          conversationId: conv.id,
          userId: t.creatorId,
        },
      },
      create: {
        conversationId: conv.id,
        userId: t.creatorId,
        role: 'HOST',
      },
      update: {
        role: 'HOST',
      },
    });
  }

  // Add Riya Mehta (demo user) to Gokarna trip and conversation
  await prisma.tripMember.upsert({
    where: {
      tripId_userId: {
        tripId: 'trip_women_gokarna',
        userId: demoUser.id,
      },
    },
    create: {
      id: `mem_demo_${Date.now()}`,
      tripId: 'trip_women_gokarna',
      userId: demoUser.id,
    },
    update: {},
  });

  const gokarnaConv = await prisma.conversation.findFirst({
    where: { tripId: 'trip_women_gokarna' },
  });
  if (gokarnaConv) {
    await prisma.conversationParticipant.upsert({
      where: {
        conversationId_userId: {
          conversationId: gokarnaConv.id,
          userId: demoUser.id,
        },
      },
      create: {
        conversationId: gokarnaConv.id,
        userId: demoUser.id,
        role: 'MEMBER',
      },
      update: {},
    });

    const msgCount = await prisma.message.count({ where: { conversationId: gokarnaConv.id } });
    if (msgCount === 0) {
      await prisma.message.create({
        data: {
          id: `msg_seed_1`,
          conversationId: gokarnaConv.id,
          senderId: priyaUser.id,
          body: 'Welcome to the Gokarna & Dandeli Women Explorer squad! 🌊 Our private beach cottages are locked in. Check the gear list in guidelines.',
          moderationStatus: 'APPROVED',
        },
      });
      await prisma.message.create({
        data: {
          id: `msg_seed_2`,
          conversationId: gokarnaConv.id,
          senderId: demoUser.id,
          body: 'So excited for the coastal trek and sunset yoga! Looking forward to meeting everyone in Bangalore.',
          moderationStatus: 'APPROVED',
        },
      });
    }
  }

  console.log(`✅ Seeded ${tripsData.length} trips with conversation rooms and membership relations.`);
  console.log('🎉 ChaloBuddy relational database seed complete!');
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
