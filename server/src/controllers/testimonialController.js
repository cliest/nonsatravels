import prisma from '../lib/prisma.js';

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials', error: error.message });
  }
};

export const getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials', error: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { name, location, image, rating, review, isActive } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: { name, location, image, rating: rating || 5, review, isActive: isActive !== undefined ? isActive : true },
    });
    res.status(201).json({ success: true, data: testimonial, message: 'Testimonial created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create testimonial', error: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { name, location, image, rating, review, isActive } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { name, location, image, rating, review, isActive },
    });
    res.status(200).json({ success: true, data: testimonial, message: 'Testimonial updated successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.status(400).json({ success: false, message: 'Failed to update testimonial', error: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.status(500).json({ success: false, message: 'Failed to delete testimonial', error: error.message });
  }
};

export const toggleTestimonialStatus = async (req, res) => {
  try {
    const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Testimonial not found' });

    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { isActive: !existing.isActive },
    });
    res.status(200).json({
      success: true,
      data: testimonial,
      message: `Testimonial ${testimonial.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle testimonial status', error: error.message });
  }
};
