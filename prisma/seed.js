import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  INITIAL_USERS,
  INITIAL_TRIPS,
  INITIAL_STAYS,
  INITIAL_STORIES,
  INITIAL_CONVERSATIONS,
} from '../client/src/data/seedData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ChaloBuddy database seeding...');

  // 1. Seed Users
  const userMap = new Map();
  for (const u of INITIAL_USERS) {
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    const created = await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: {
        name: u.name,
        role: u.role === 'organizer' ? 'ORGANIZER' : u.role === 'admin' ? 'ADMIN' : 'TRAVELER',
        verified: u.verified,
        rating: u.rating,
        tripsHosted: u.tripsHosted,
        tripsCompleted: u.tripsCompleted,
        location: u.location,
        bio: u.bio,
        travelStyle: u.travelStyle,
        interests: u.interests,
        languages: u.languages,
      },
      create: {
        id: u.id,
        email: u.email.toLowerCase(),
        passwordHash,
        name: u.name,
        role: u.role === 'organizer' ? 'ORGANIZER' : u.role === 'admin' ? 'ADMIN' : 'TRAVELER',
        verified: u.verified,
        rating: u.rating,
        tripsHosted: u.tripsHosted,
        tripsCompleted: u.tripsCompleted,
        avatar: u.avatar,
        location: u.location,
        bio: u.bio,
        travelStyle: u.travelStyle,
        interests: u.interests,
        languages: u.languages,
      },
    });

    userMap.set(u.id, created);
  }
  console.log(`✅ Seeded ${userMap.size} users.`);

  // 2. Seed Stays
  let stayCount = 0;
  for (const s of INITIAL_STAYS) {
    await prisma.stay.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        location: s.location,
        lat: s.lat || null,
        lng: s.lng || null,
        type: s.type || 'Homestay',
        pricePerNight: s.pricePerNight,
        rating: s.rating,
        reviewCount: s.reviewCount || 0,
        images: s.images,
        amenities: s.amenities,
        description: s.description,
        hostName: s.host?.name || 'Verified Host',
      },
      create: {
        id: s.id,
        name: s.name,
        location: s.location,
        lat: s.lat || null,
        lng: s.lng || null,
        type: s.type || 'Homestay',
        pricePerNight: s.pricePerNight,
        rating: s.rating,
        reviewCount: s.reviewCount || 0,
        images: s.images,
        amenities: s.amenities,
        description: s.description,
        hostName: s.host?.name || 'Verified Host',
      },
    });
    stayCount++;
  }
  console.log(`✅ Seeded ${stayCount} boutique stays.`);

  // 3. Seed Trips & Associated Trip Rooms
  let tripCount = 0;
  for (const t of INITIAL_TRIPS) {
    const organizerId = t.organizer?.id || 'usr_aarav';
    const host = userMap.get(organizerId) || userMap.get('usr_aarav');

    // Create Conversation for the trip
    const conversation = await prisma.conversation.create({
      data: {
        title: `${t.title} • Trip Room`,
        isGroup: true,
        participants: {
          create: {
            userId: host.id,
          },
        },
      },
    });

    // Parse dates
    const startDate = t.startDate ? new Date(t.startDate) : new Date(Date.now() + 15 * 86400000);
    const endDate = new Date(startDate.getTime() + 4 * 86400000);

    await prisma.trip.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        subtitle: t.subtitle,
        startingLocation: t.startingLocation || 'Delhi, India',
        destination: t.destination,
        startDate,
        endDate,
        duration: t.duration,
        price: t.price,
        maxGroupSize: t.maxGroupSize || 10,
        spotsLeft: t.spotsLeft || 4,
        difficulty: t.difficulty || 'Moderate',
        meetingPoint: t.meetingPoint || 'Assembly Point',
        transport: t.transport || 'Private Coach',
        stayDetails: t.stayDetails || 'Boutique Homestay',
        about: t.about || t.subtitle,
        included: t.included || [],
        excluded: t.excluded || [],
        images: t.images || [],
        vibes: t.vibes || [],
        featured: Boolean(t.featured),
        rating: t.rating || 5.0,
        reviewCount: t.reviewCount || 0,
        organizerId: host.id,
      },
      create: {
        id: t.id,
        title: t.title,
        subtitle: t.subtitle,
        startingLocation: t.startingLocation || 'Delhi, India',
        destination: t.destination,
        startDate,
        endDate,
        duration: t.duration,
        price: t.price,
        maxGroupSize: t.maxGroupSize || 10,
        spotsLeft: t.spotsLeft || 4,
        difficulty: t.difficulty || 'Moderate',
        meetingPoint: t.meetingPoint || 'Assembly Point',
        transport: t.transport || 'Private Coach',
        stayDetails: t.stayDetails || 'Boutique Homestay',
        about: t.about || t.subtitle,
        included: t.included || [],
        excluded: t.excluded || [],
        images: t.images || [],
        vibes: t.vibes || [],
        featured: Boolean(t.featured),
        rating: t.rating || 5.0,
        reviewCount: t.reviewCount || 0,
        organizerId: host.id,
        conversationId: conversation.id,
      },
    });
    tripCount++;
  }
  console.log(`✅ Seeded ${tripCount} group trips.`);

  // 4. Seed Stories
  let storyCount = 0;
  for (const s of INITIAL_STORIES) {
    const author = userMap.get('usr_priya') || userMap.values().next().value;
    await prisma.story.upsert({
      where: { id: s.id },
      update: {
        title: s.title,
        location: s.location,
        content: s.content,
        image: s.image,
        likes: s.likes || 0,
      },
      create: {
        id: s.id,
        title: s.title,
        location: s.location,
        content: s.content,
        image: s.image,
        likes: s.likes || 0,
        authorId: author.id,
      },
    });
    storyCount++;
  }
  console.log(`✅ Seeded ${storyCount} travel stories.`);

  console.log('🎉 ChaloBuddy database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
