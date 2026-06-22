import dotenv from 'dotenv';
dotenv.config({ override: true });

import prisma from './lib/prisma.js';

async function migrate() {
  const hotels = await prisma.hotel.findMany({ include: { roomTypes: true } });
  let created = 0;

  for (const hotel of hotels) {
    if (hotel.roomTypes.length > 0) continue;

    await prisma.roomType.create({
      data: {
        hotelId: hotel.id,
        name: hotel.roomType || 'Double Bed',
        pricePerNight: hotel.pricePerNight,
        roomCount: hotel.totalRooms || 10,
        maxGuests: 2,
        description: `${hotel.roomType || 'Standard'} room at ${hotel.name}`,
      },
    });
    created++;
    console.log(`Created room type for: ${hotel.name} (${hotel.roomType} @ $${hotel.pricePerNight})`);
  }

  console.log(`Done. Created ${created} room types for ${hotels.length} hotels.`);
  await prisma.$disconnect();
}

migrate().catch(e => { console.error(e); process.exit(1); });
