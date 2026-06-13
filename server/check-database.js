import dotenv from 'dotenv';
import prisma from './src/lib/prisma.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    await prisma.$connect();
    console.log(' Connected to PostgreSQL\n');

    const [
      totalHotels, totalOffers, totalTestimonials, totalBookings,
      pendingPayment, paymentConfirmed, confirmed, completed, cancelled,
      revenueResult,
    ] = await Promise.all([
      prisma.hotel.count(),
      prisma.offer.count(),
      prisma.testimonial.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'pending_payment' } }),
      prisma.booking.count({ where: { status: 'payment_confirmed' } }),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.count({ where: { status: 'completed' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.booking.aggregate({ _sum: { totalPrice: true } }),
    ]);

    const totalRevenue = revenueResult._sum.totalPrice || 0;

    console.log(' Database Statistics:\n');
    console.log(' Hotels:', totalHotels);
    console.log(' Offers:', totalOffers);
    console.log(' Testimonials:', totalTestimonials);
    console.log('\n Bookings Breakdown:');
    console.log('├─ Total Bookings:', totalBookings);
    console.log('├─ Pending Payment:', pendingPayment);
    console.log('├─ Payment Confirmed:', paymentConfirmed);
    console.log('├─ Confirmed:', confirmed);
    console.log('├─ Completed:', completed);
    console.log('└─ Cancelled:', cancelled);
    console.log('\n Total Revenue: $' + totalRevenue.toLocaleString());

    console.log('\n Sample Bookings (Latest 5):');
    const latestBookings = await prisma.booking.findMany({
      include: { hotel: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    latestBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. ${booking.userName}`);
      console.log(`   Hotel: ${booking.hotel?.name || 'N/A'}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Price: $${booking.totalPrice}`);
      console.log(`   Created: ${booking.createdAt.toLocaleDateString()}`);
    });

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
};

checkDatabase();
