import prisma from '../lib/prisma.js';

export const getServices = async (req, res) => {
  try {
    const services = await prisma.additionalService.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.additionalService.findMany({ orderBy: { sortOrder: 'asc' } });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createService = async (req, res) => {
  try {
    const svc = await prisma.additionalService.create({ data: req.body });
    res.status(201).json({ success: true, data: svc });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create service', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateService = async (req, res) => {
  try {
    const svc = await prisma.additionalService.update({ where: { id: req.params.id }, data: req.body });
    res.status(200).json({ success: true, data: svc });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(400).json({ success: false, message: 'Failed to update service' });
  }
};

export const deleteService = async (req, res) => {
  try {
    await prisma.additionalService.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Service deleted' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
};

export const seedServices = async (req, res) => {
  try {
    const existing = await prisma.additionalService.count();
    if (existing > 0) return res.status(200).json({ success: true, message: 'Services already seeded', count: existing });

    const defaults = [
      { name: 'airportTransfer', label: 'Airport Transfer', cost: 1.2, icon: 'faCar', sortOrder: 0 },
      { name: 'earlyCheckIn', label: 'Early Check-in', cost: 30, icon: 'faClock', sortOrder: 1 },
      { name: 'lateCheckOut', label: 'Late Check-out', cost: 30, icon: 'faClock', sortOrder: 2 },
      { name: 'extraBed', label: 'Extra Bed', cost: 25, icon: 'faBed', sortOrder: 3 },
      { name: 'breakfast', label: 'Daily Breakfast', cost: 15, icon: 'faUtensils', sortOrder: 4 },
    ];

    await prisma.additionalService.createMany({ data: defaults });
    res.status(201).json({ success: true, message: `Seeded ${defaults.length} services` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to seed services', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
