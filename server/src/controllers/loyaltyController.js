import prisma from '../lib/prisma.js';

const TIER_THRESHOLDS = { bronze: 0, silver: 1500, gold: 5000, platinum: 15000 };
const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'];

const getTierBenefits = (tier) => {
  const benefits = {
    bronze: { discount: 0, pointsMultiplier: 1, prioritySupport: false, freeWifi: true, earlyCheckIn: false, lateCheckOut: false },
    silver: { discount: 5, pointsMultiplier: 1.25, prioritySupport: false, freeWifi: true, earlyCheckIn: true, lateCheckOut: false },
    gold: { discount: 10, pointsMultiplier: 1.5, prioritySupport: true, freeWifi: true, earlyCheckIn: true, lateCheckOut: true },
    platinum: { discount: 15, pointsMultiplier: 2, prioritySupport: true, freeWifi: true, earlyCheckIn: true, lateCheckOut: true },
  };
  return benefits[tier];
};

const computeTier = (totalPointsEarned) => {
  if (totalPointsEarned >= 15000) return 'platinum';
  if (totalPointsEarned >= 5000) return 'gold';
  if (totalPointsEarned >= 1500) return 'silver';
  return 'bronze';
};

const getNextTier = (currentTier, totalPointsEarned) => {
  const tiers = {
    bronze: { name: 'Silver', pointsRequired: 1500 },
    silver: { name: 'Gold', pointsRequired: 5000 },
    gold: { name: 'Platinum', pointsRequired: 15000 },
    platinum: { name: 'Platinum', pointsRequired: 0 },
  };
  const next = tiers[currentTier];
  if (next.pointsRequired === 0) return { tier: 'Platinum', pointsNeeded: 0, progress: 100 };
  const pointsNeeded = Math.max(next.pointsRequired - totalPointsEarned, 0);
  const progress = Math.round(Math.min((totalPointsEarned / next.pointsRequired) * 100, 100));
  return { tier: next.name, pointsNeeded, progress };
};

const getOrCreateLoyalty = async (userId) => {
  let loyalty = await prisma.loyalty.findUnique({
    where: { userId },
    include: { tierHistory: true, pointsHistory: true },
  });
  if (!loyalty) {
    loyalty = await prisma.loyalty.create({
      data: { userId },
      include: { tierHistory: true, pointsHistory: true },
    });
  }
  return loyalty;
};

export const getMyLoyalty = async (req, res) => {
  try {
    const userId = req.user.id;
    const loyalty = await getOrCreateLoyalty(userId);
    const benefits = getTierBenefits(loyalty.tier);

    res.status(200).json({
      success: true,
      data: {
        points: loyalty.points,
        tier: loyalty.tier,
        totalPointsEarned: loyalty.totalPointsEarned,
        totalPointsRedeemed: loyalty.totalPointsRedeemed,
        benefits,
        tierHistory: loyalty.tierHistory,
        nextTier: getNextTier(loyalty.tier, loyalty.totalPointsEarned),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get loyalty information', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getPointsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const loyalty = await prisma.loyalty.findUnique({ where: { userId } });
    if (!loyalty) return res.status(404).json({ success: false, message: 'Loyalty account not found' });

    const history = await prisma.loyaltyPointsHistory.findMany({
      where: { loyaltyId: loyalty.id },
      orderBy: { date: 'desc' },
      take: limit,
    });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get points history', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const awardPoints = async (userId, bookingId, totalPrice) => {
  try {
    let loyalty = await getOrCreateLoyalty(userId);

    const basePoints = Math.floor(totalPrice * 10);
    const benefits = getTierBenefits(loyalty.tier);
    const pointsEarned = Math.floor(basePoints * benefits.pointsMultiplier);

    const newTotalEarned = loyalty.totalPointsEarned + pointsEarned;
    const newTier = computeTier(newTotalEarned);
    const tierUpgraded = newTier !== loyalty.tier;

    const updates = {
      points: { increment: pointsEarned },
      totalPointsEarned: { increment: pointsEarned },
    };
    if (tierUpgraded) updates.tier = newTier;

    await prisma.loyalty.update({ where: { id: loyalty.id }, data: updates });
    await prisma.loyaltyPointsHistory.create({
      data: {
        loyaltyId: loyalty.id,
        type: 'earned',
        amount: pointsEarned,
        bookingId,
        description: `Earned ${pointsEarned} points from $${totalPrice.toFixed(2)} booking`,
      },
    });

    if (tierUpgraded) {
      await prisma.loyaltyTierHistory.create({ data: { loyaltyId: loyalty.id, tier: newTier } });
    }

    return { success: true, pointsEarned, tierUpgraded, newTier, currentPoints: loyalty.points + pointsEarned };
  } catch (error) {
    console.error('Award points error:', error);
    return { success: false, error: process.env.NODE_ENV === 'development' ? error.message : undefined };
  }
};

export const redeemPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { points } = req.body;

    if (!points || points < 100) {
      return res.status(400).json({ success: false, message: 'Minimum 100 points required for redemption' });
    }

    const loyalty = await prisma.loyalty.findUnique({ where: { userId } });
    if (!loyalty) return res.status(404).json({ success: false, message: 'Loyalty account not found' });
    if (loyalty.points < points) return res.status(400).json({ success: false, message: 'Insufficient points' });

    const discountAmount = points / 100;
    const redemptionToken = Buffer.from(JSON.stringify({
      userId, points, discountAmount, expiresAt: Date.now() + 30 * 60 * 1000,
    })).toString('base64');

    res.status(200).json({ success: true, data: { points, discountAmount, redemptionToken } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to redeem points', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const applyPointsRedemption = async (userId, bookingId, points) => {
  try {
    const loyalty = await prisma.loyalty.findUnique({ where: { userId } });
    if (!loyalty || loyalty.points < points) return { success: false, message: 'Insufficient points' };

    const discountAmount = points / 100;

    await prisma.loyalty.update({
      where: { id: loyalty.id },
      data: { points: { decrement: points }, totalPointsRedeemed: { increment: points } },
    });
    await prisma.loyaltyPointsHistory.create({
      data: {
        loyaltyId: loyalty.id,
        type: 'redeemed',
        amount: -points,
        bookingId,
        description: `Redeemed ${points} points for $${discountAmount.toFixed(2)} discount`,
      },
    });

    return { success: true, pointsRedeemed: points, discountAmount, remainingPoints: loyalty.points - points };
  } catch (error) {
    console.error('Apply points redemption error:', error);
    return { success: false, error: process.env.NODE_ENV === 'development' ? error.message : undefined };
  }
};
