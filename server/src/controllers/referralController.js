import prisma from '../lib/prisma.js';

const generateCode = async (userId) => {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const userPrefix = userId.substring(0, 3).toUpperCase();
  const code = `${userPrefix}${randomStr}`;

  const existing = await prisma.referral.findUnique({ where: { referralCode: code } });
  if (existing) return generateCode(userId);
  return code;
};

export const getReferralCode = async (req, res) => {
  try {
    const userId = req.user.id;

    let referral = await prisma.referral.findUnique({ where: { userId } });

    if (!referral) {
      const code = await generateCode(userId);
      referral = await prisma.referral.create({ data: { userId, referralCode: code } });
    }

    res.status(200).json({
      success: true,
      data: {
        referralCode: referral.referralCode,
        totalReferrals: referral.totalReferrals,
        totalDiscountEarned: referral.totalDiscountEarned,
        totalDiscountGiven: referral.totalDiscountGiven,
        shareUrl: `${process.env.CLIENT_URL}?ref=${referral.referralCode}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get referral code', error: error.message });
  }
};

export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;
    const referral = await prisma.referral.findFirst({
      where: { referralCode: code.toUpperCase(), isActive: true },
    });

    if (!referral) return res.status(404).json({ success: false, message: 'Invalid referral code' });

    res.status(200).json({
      success: true,
      data: { valid: true, discountPercentage: 10, maxDiscount: 50, referralCode: referral.referralCode },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to validate referral code', error: error.message });
  }
};

export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const referral = await prisma.referral.findUnique({
      where: { userId },
      include: { referredUsers: { orderBy: { referredAt: 'desc' }, take: 10 } },
    });

    if (!referral) return res.status(404).json({ success: false, message: 'No referral data found' });

    res.status(200).json({
      success: true,
      data: {
        referralCode: referral.referralCode,
        totalReferrals: referral.totalReferrals,
        totalDiscountEarned: referral.totalDiscountEarned,
        totalDiscountGiven: referral.totalDiscountGiven,
        recentReferrals: referral.referredUsers,
        shareUrl: `${process.env.CLIENT_URL}?ref=${referral.referralCode}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get referral statistics', error: error.message });
  }
};

export const applyReferralDiscount = async (userId, email, bookingId, totalPrice, referralCode) => {
  try {
    if (!referralCode) return { applied: false };

    const referral = await prisma.referral.findFirst({
      where: { referralCode: referralCode.toUpperCase(), isActive: true },
    });

    if (!referral) return { applied: false, message: 'Invalid referral code' };
    if (referral.userId === userId) return { applied: false, message: 'Cannot use your own referral code' };

    // Check if this user already used a referral code
    const alreadyReferred = await prisma.referredUser.findFirst({ where: { userId } });
    if (alreadyReferred) return { applied: false, message: 'You have already used a referral code' };

    const discountAmount = Math.min(totalPrice * 0.1, 50);
    const finalPrice = totalPrice - discountAmount;

    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        totalReferrals: { increment: 1 },
        totalDiscountGiven: { increment: discountAmount },
        totalDiscountEarned: { increment: Math.round(discountAmount * 0.1) },
        referredUsers: {
          create: { userId: userId || 'guest', email, bookingId, discountAmount },
        },
      },
    });

    return { applied: true, discountAmount, finalPrice, message: `Referral discount of $${discountAmount.toFixed(2)} applied` };
  } catch (error) {
    console.error('Apply referral discount error:', error);
    return { applied: false, message: 'Failed to apply referral discount' };
  }
};
