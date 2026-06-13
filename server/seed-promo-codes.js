import dotenv from 'dotenv';
import prisma from './src/lib/prisma.js';

dotenv.config();

const samplePromoCodes = [
  { code: 'WELCOME10', description: '10% off your first booking', discountType: 'percentage', discountValue: 10, minBookingAmount: 50, maxDiscount: 100, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), usageLimit: 1000, usagePerUser: 1, isFirstBookingOnly: true, isActive: true },
  { code: 'SUMMER25', description: '25% off summer bookings', discountType: 'percentage', discountValue: 25, minBookingAmount: 100, maxDiscount: 200, validFrom: new Date(), validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), usageLimit: 500, usagePerUser: 2, isActive: true },
  { code: 'FLAT50', description: '$50 off bookings over $300', discountType: 'fixed', discountValue: 50, minBookingAmount: 300, maxDiscount: null, validFrom: new Date(), validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 200, usagePerUser: 1, isActive: true },
  { code: 'VIP20', description: '20% off for VIP members', discountType: 'percentage', discountValue: 20, minBookingAmount: 0, maxDiscount: 500, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), usageLimit: null, usagePerUser: 10, isActive: true },
];

async function seedPromoCodes() {
  try {
    await prisma.$connect();
    console.log(' Connected to PostgreSQL');

    await prisma.promoCode.deleteMany();
    console.log('  Cleared existing promo codes');

    for (const promo of samplePromoCodes) {
      await prisma.promoCode.create({ data: promo });
    }

    console.log(` Inserted ${samplePromoCodes.length} promo codes`);
    console.log('\nTest codes:');
    console.log('   WELCOME10 - 10% off (first booking only)');
    console.log('   SUMMER25  - 25% off (max $200)');
    console.log('   FLAT50    - $50 off (min $300 booking)');
    console.log('   VIP20     - 20% off (VIP members)');
    console.log('\n Promo codes seeded successfully!');
  } catch (error) {
    console.error('Error seeding promo codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPromoCodes();
