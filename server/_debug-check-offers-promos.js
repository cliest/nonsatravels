import dotenv from 'dotenv';
import prisma from './src/lib/prisma.js';

dotenv.config();

const run = async () => {
  await prisma.$connect();

  const offers = await prisma.offer.findMany();
  console.log(`\n${offers.length} offer(s):`);
  for (const o of offers) {
    console.log(`- "${o.title}" priceOff=${o.priceOff} hotelId=${o.hotelId ?? 'none'} promoCode=${o.promoCode ?? 'null'} expiryDate=${o.expiryDate}`);
  }

  const promoCodes = await prisma.promoCode.findMany();
  console.log(`\n${promoCodes.length} promo code(s):`);
  for (const p of promoCodes) {
    console.log(`- ${p.code} | applicableHotels=${JSON.stringify(p.applicableHotels)} | active=${p.isActive} | ${p.discountType} ${p.discountValue}`);
  }

  await prisma.$disconnect();
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
