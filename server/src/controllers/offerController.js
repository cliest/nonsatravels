import prisma from '../lib/prisma.js';

// Offer.promoCode is just a display string with no schema relationship to PromoCode —
// the actual hotel restriction lives on PromoCode.applicableHotels. Without this sync,
// an offer scoped to one hotel (via hotelId) silently validates for every hotel unless
// someone manually created a matching, correctly-restricted PromoCode row.
export const syncPromoCodeForOffer = async (offer) => {
  if (!offer.promoCode) return;

  const code = offer.promoCode.toUpperCase();
  const applicableHotels = offer.hotelId ? [offer.hotelId] : [];
  const existing = await prisma.promoCode.findUnique({ where: { code } });

  if (existing) {
    // Only sync the hotel restriction and expiry — don't clobber discount fields an
    // admin may have deliberately customized on an already-existing code.
    await prisma.promoCode.update({
      where: { code },
      data: { applicableHotels, validUntil: new Date(offer.expiryDate) },
    });
  } else {
    await prisma.promoCode.create({
      data: {
        code,
        description: `Auto-generated for offer: ${offer.title}`,
        discountType: 'percentage',
        discountValue: offer.priceOff,
        validFrom: new Date(),
        validUntil: new Date(offer.expiryDate),
        applicableHotels,
        createdBy: 'system:offer-sync',
      },
    });
  }
};

export const getOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getOfferById = async (req, res) => {
  try {
    const offer = await prisma.offer.findUnique({ where: { id: req.params.id } });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const createOffer = async (req, res) => {
  try {
    const offer = await prisma.offer.create({ data: req.body });
    try {
      await syncPromoCodeForOffer(offer);
    } catch (syncError) {
      console.error('Failed to sync promo code for offer:', syncError);
    }
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create offer', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await prisma.offer.update({ where: { id: req.params.id }, data: req.body });
    try {
      await syncPromoCodeForOffer(offer);
    } catch (syncError) {
      console.error('Failed to sync promo code for offer:', syncError);
    }
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(400).json({ success: false, message: 'Failed to update offer', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    await prisma.offer.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(500).json({ success: false, message: 'Failed to delete offer', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
