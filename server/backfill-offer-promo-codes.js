// One-off backfill: re-syncs applicableHotels on every existing offer's PromoCode row.
// Needed because offerController.js only started doing this sync going forward — offers
// created/updated before that change may have a promo code that's still unrestricted
// (valid for every hotel) even though the offer itself is scoped to one hotel.

import dotenv from 'dotenv';
import prisma from './src/lib/prisma.js';
import { syncPromoCodeForOffer } from './src/controllers/offerController.js';

dotenv.config();

const backfill = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL\n');

    const offers = await prisma.offer.findMany({ where: { promoCode: { not: null } } });
    console.log(`Found ${offers.length} offer(s) with a promo code\n`);

    for (const offer of offers) {
      await syncPromoCodeForOffer(offer);
      console.log(`✓ ${offer.title} — code "${offer.promoCode}" scoped to ${offer.hotelId ? `hotel ${offer.hotelId}` : 'all hotels (sitewide, by design)'}`);
    }

    console.log('\nBackfill complete.');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

backfill();
