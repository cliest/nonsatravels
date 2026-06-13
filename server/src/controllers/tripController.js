import prisma from '../lib/prisma.js';

const tripInclude = {
  destinations: {
    include: {
      hotel: true,
      activities: true,
    },
  },
};

const calculateEstimatedCost = (destinations) => {
  let total = 0;
  (destinations || []).forEach((dest) => {
    (dest.activities || []).forEach((activity) => {
      if (activity.estimatedCost) total += activity.estimatedCost;
    });
  });
  return total;
};

const formatTrip = (trip) => {
  if (!trip) return null;
  const durationMs = Math.abs(new Date(trip.endDate) - new Date(trip.startDate));
  const duration = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  return { ...trip, duration };
};

export const getMyTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: tripInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: trips.map(formatTrip) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trips' });
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id }, include: tripInclude });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.userId !== req.user.id && !trip.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, data: formatTrip(trip) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trip' });
  }
};

export const getTripByToken = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { shareToken: req.params.token }, include: tripInclude });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.status(200).json({ success: true, data: formatTrip(trip) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trip' });
  }
};

export const createTrip = async (req, res) => {
  try {
    const { destinations, tags, ...tripData } = req.body;

    const trip = await prisma.trip.create({
      data: {
        ...tripData,
        userId: req.user.id,
        tags: tags || [],
        destinations: destinations
          ? {
              create: destinations.map(({ activities, ...dest }) => ({
                ...dest,
                checkIn: new Date(dest.checkIn),
                checkOut: new Date(dest.checkOut),
                activities: activities ? { create: activities } : undefined,
              })),
            }
          : undefined,
      },
      include: tripInclude,
    });

    const estimatedCost = calculateEstimatedCost(trip.destinations);
    const updated = estimatedCost > 0
      ? await prisma.trip.update({ where: { id: trip.id }, data: { estimatedCost }, include: tripInclude })
      : trip;

    res.status(201).json({ success: true, message: 'Trip created successfully', data: formatTrip(updated) });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ success: false, message: 'Failed to create trip' });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id }, include: tripInclude });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    const { destinations, tags, ...updateData } = req.body;

    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        tags: tags !== undefined ? tags : trip.tags,
      },
      include: tripInclude,
    });

    const estimatedCost = calculateEstimatedCost(updated.destinations);
    const final = await prisma.trip.update({ where: { id: updated.id }, data: { estimatedCost }, include: tripInclude });

    res.status(200).json({ success: true, message: 'Trip updated successfully', data: formatTrip(final) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update trip' });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    await prisma.trip.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete trip' });
  }
};

export const generateShareLink = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    let shareToken = trip.shareToken;
    if (!shareToken) {
      shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await prisma.trip.update({ where: { id: req.params.id }, data: { shareToken, isPublic: true } });
    }

    res.status(200).json({
      success: true,
      data: {
        shareToken,
        shareUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/trips/shared/${shareToken}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate share link' });
  }
};

export const addDestination = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    const { activities, ...destData } = req.body;

    await prisma.tripDestination.create({
      data: {
        ...destData,
        tripId: trip.id,
        checkIn: new Date(destData.checkIn),
        checkOut: new Date(destData.checkOut),
        activities: activities ? { create: activities } : undefined,
      },
    });

    const updated = await prisma.trip.findUnique({ where: { id: trip.id }, include: tripInclude });
    const estimatedCost = calculateEstimatedCost(updated.destinations);
    const final = await prisma.trip.update({ where: { id: trip.id }, data: { estimatedCost }, include: tripInclude });

    res.status(200).json({ success: true, message: 'Destination added successfully', data: formatTrip(final) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add destination' });
  }
};

export const addActivity = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    const destination = await prisma.tripDestination.findUnique({ where: { id: destinationId } });
    if (!destination || destination.tripId !== trip.id) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    await prisma.activity.create({ data: { ...req.body, destinationId } });

    const updated = await prisma.trip.findUnique({ where: { id: trip.id }, include: tripInclude });
    const estimatedCost = calculateEstimatedCost(updated.destinations);
    const final = await prisma.trip.update({ where: { id: trip.id }, data: { estimatedCost }, include: tripInclude });

    res.status(200).json({ success: true, message: 'Activity added successfully', data: formatTrip(final) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add activity' });
  }
};
