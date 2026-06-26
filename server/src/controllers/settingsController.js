import prisma from '../lib/prisma.js';

const DEFAULTS = {
  roomTypes: [
    "Single Bed", "Double Bed", "Standard Room", "Superior Room", "Club Room",
    "Executive Room", "Family Suite", "Deluxe Suite", "Luxury Suite",
    "Presidential Suite", "1 Bedroom Suite", "Inter-Leading",
    "The Sunset House", "Island Bush Camp", "Three Rivers Camp",
  ],
  companyInfo: {
    name: "Nonsa Travels",
    phone: "+260 970 462 777",
    email: "info@nonsatravels.com",
    address: "Kwacha Street, Chingola, Zambia",
  },
  checkInTime: "14:00",
  checkOutTime: "11:00",
};

export const getSetting = async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
    if (!setting) {
      const fallback = DEFAULTS[req.params.key];
      if (fallback !== undefined) return res.status(200).json({ success: true, data: { key: req.params.key, value: fallback } });
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllSettings = async (req, res) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    Object.keys(DEFAULTS).forEach(k => { if (!(k in map)) map[k] = DEFAULTS[k]; });
    res.status(200).json({ success: true, data: map });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const upsertSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Key is required' });
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to save setting', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const deleteSetting = async (req, res) => {
  try {
    await prisma.siteSetting.delete({ where: { key: req.params.key } });
    res.status(200).json({ success: true, message: 'Setting reset to default' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete setting' });
  }
};
