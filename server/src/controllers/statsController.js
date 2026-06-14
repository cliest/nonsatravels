import prisma from '../lib/prisma.js';

export const getStats = async (req, res) => {
  try {
    const [totalHotels, totalBookings, cities, totalTestimonials, revenueResult] = await Promise.all([
      prisma.hotel.count(),
      prisma.booking.count({ where: { status: { in: ['completed', 'confirmed', 'payment_confirmed'] } } }),
      prisma.hotel.findMany({ select: { city: true }, distinct: ['city'] }),
      prisma.testimonial.count({ where: { isActive: true } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ['completed', 'confirmed', 'payment_confirmed'] } },
      }),
    ]);

    const totalDestinations = cities.length;
    const yearsOfExperience = new Date().getFullYear() - 2010;
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    res.status(200).json({
      success: true,
      data: { totalHotels, totalBookings, totalDestinations, totalTestimonials, yearsOfExperience, totalRevenue },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
