import prisma from '../lib/prisma.js';
import { calculateDynamicPrice } from '../utils/dynamicPricing.js';
import { sendEmail } from '../utils/emailService.js';
import { emailHeader, emailFooter, emailStyles } from '../utils/emailTemplates.js';

export const createSavedSearch = async (req, res) => {
  try {
    const { city, checkIn, checkOut, guests, maxPrice } = req.body;
    const saved = await prisma.savedSearch.create({
      data: {
        userId: req.user.id,
        city: city || null,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        guests: parseInt(guests) || 1,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      },
    });
    res.status(201).json({ success: true, data: saved, message: 'Search saved! We\'ll notify you of price drops.' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to save search' });
  }
};

export const getMySavedSearches = async (req, res) => {
  try {
    const searches = await prisma.savedSearch.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: searches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteSavedSearch = async (req, res) => {
  try {
    const search = await prisma.savedSearch.findUnique({ where: { id: req.params.id } });
    if (!search || search.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await prisma.savedSearch.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Saved search removed' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to remove search' });
  }
};

export const checkPriceAlerts = async () => {
  try {
    const searches = await prisma.savedSearch.findMany({
      where: { isActive: true, checkIn: { not: null }, checkOut: { not: null } },
    });

    for (const search of searches) {
      if (new Date(search.checkIn) < new Date()) {
        await prisma.savedSearch.update({ where: { id: search.id }, data: { isActive: false } });
        continue;
      }

      const hotels = await prisma.hotel.findMany({
        where: search.city ? { city: search.city } : {},
        take: 5,
        orderBy: { pricePerNight: 'asc' },
      });

      for (const hotel of hotels) {
        try {
          const pricing = await calculateDynamicPrice(hotel.id, search.checkIn, search.checkOut);
          const currentPrice = pricing.pricePerNight;

          if (search.lastNotifiedPrice && currentPrice < search.lastNotifiedPrice * 0.95) {
            const user = await prisma.user.findUnique({ where: { id: search.userId } });
            if (!user) continue;

            await sendEmail({
              to: user.email,
              subject: `Price Drop Alert: ${hotel.name} now $${currentPrice}/night!`,
              html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${emailStyles}</style></head><body><div class="container">${emailHeader('Price Drop Alert!', 'A hotel on your watchlist just got cheaper', '#10b981 0%, #059669 100%')}<div class="content"><p>Hi ${user.firstName},</p><p><strong>${hotel.name}</strong> in ${hotel.city} dropped from <s>$${search.lastNotifiedPrice.toFixed(0)}</s> to <strong>$${currentPrice.toFixed(0)}/night</strong>!</p><div style="text-align:center;margin:24px 0"><a href="${process.env.FRONTEND_URL || 'https://nonsatravels.com'}/hotels/${hotel.id}" class="btn">Book Now</a></div></div>${emailFooter()}</div></body></html>`,
              text: `Price drop: ${hotel.name} now $${currentPrice}/night (was $${search.lastNotifiedPrice}). Book at ${process.env.FRONTEND_URL || 'https://nonsatravels.com'}/hotels/${hotel.id}`,
              tags: ['price-alert'],
            });

            await prisma.savedSearch.update({
              where: { id: search.id },
              data: { lastNotifiedPrice: currentPrice },
            });
            break;
          }

          if (!search.lastNotifiedPrice) {
            await prisma.savedSearch.update({
              where: { id: search.id },
              data: { lastNotifiedPrice: currentPrice },
            });
          }
        } catch {}
      }
    }
  } catch (error) {
    console.error('Price alert check failed:', error);
  }
};
