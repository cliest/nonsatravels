import Joi from 'joi';

// Hotel validation schemas
export const hotelSchema = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100).trim(),
    city: Joi.string().required().min(2).max(50).trim(),
    address: Joi.string().required().min(5).max(200).trim(),
    contact: Joi.string().allow('').max(20).trim(),
    pricePerNight: Joi.number().required().min(0),
    rating: Joi.number().min(0).max(5).default(4.5),
    roomType: Joi.string().valid('Single Bed', 'Double Bed', 'Executive Room', 'Family Suite', 'Deluxe Suite', 'Presidential Suite').default('Single Bed'),
    amenities: Joi.array().items(Joi.string().trim()).default([]),
    images: Joi.array().items(Joi.string().uri()).default([]),
    description: Joi.string().max(2000).default(''),
    isFeatured: Joi.boolean().default(false),
    isAvailable: Joi.boolean().default(true),
    totalRooms: Joi.number().integer().min(1).default(10),
    basePricePerNight: Joi.number().min(0),
    dynamicPricing: Joi.object({
      enabled: Joi.boolean().default(false),
      peakSeasonMultiplier: Joi.number().min(1).default(1.5),
      lowOccupancyDiscount: Joi.number().min(0).max(1).default(0.1),
      highDemandMultiplier: Joi.number().min(1).default(1.3),
    }).default({}),
  }),
  update: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    city: Joi.string().min(2).max(50).trim(),
    address: Joi.string().min(5).max(200).trim(),
    contact: Joi.string().allow('').max(20).trim(),
    pricePerNight: Joi.number().min(0),
    rating: Joi.number().min(0).max(5),
    roomType: Joi.string().valid('Single Bed', 'Double Bed', 'Executive Room', 'Family Suite', 'Deluxe Suite', 'Presidential Suite'),
    amenities: Joi.array().items(Joi.string().trim()),
    images: Joi.array().items(Joi.string().uri()),
    description: Joi.string().max(2000),
    isFeatured: Joi.boolean(),
    isAvailable: Joi.boolean(),
    totalRooms: Joi.number().integer().min(1),
    basePricePerNight: Joi.number().min(0),
    dynamicPricing: Joi.object({
      enabled: Joi.boolean(),
      peakSeasonMultiplier: Joi.number().min(1),
      lowOccupancyDiscount: Joi.number().min(0).max(1),
      highDemandMultiplier: Joi.number().min(1),
    }),
  }),
};

// Booking validation schemas
export const bookingSchema = {
  create: Joi.object({
    hotelId: Joi.string().required(),
    checkInDate: Joi.date().required(),
    checkOutDate: Joi.date().required().greater(Joi.ref('checkInDate')),
    guests: Joi.number().integer().min(1).max(10).default(1),
    roomsRequested: Joi.number().integer().min(1).max(10).default(1),
    totalPrice: Joi.number().required().min(0),
    userName: Joi.string().min(2).max(100).trim().optional(),
    userEmail: Joi.string().email().optional(),
    userPhone: Joi.string().allow('', null).max(20).trim(),
    specialRequests: Joi.string().allow('', null).max(500),
    roomPreferences: Joi.string().allow('', null).max(500),
    paymentId: Joi.string().allow('', null),
    paymentMethod: Joi.string().valid('flutterwave', 'bank_transfer', 'cash', 'card', 'paypal').default('bank_transfer'),
    paymentStatus: Joi.string().valid('pending', 'completed', 'failed').default('pending'),
    status: Joi.string().valid('pending_payment', 'payment_confirmed', 'confirmed', 'completed', 'cancelled', 'rejected').default('pending_payment'),
    referralCode: Joi.string().allow('', null),
  }),
  updateStatus: Joi.object({
    status: Joi.string().required().valid(
      'pending_payment', 'payment_confirmed', 'confirmed', 
      'completed', 'cancelled', 'rejected'
    ),
  }),
};

// Review validation schemas
export const reviewSchema = {
  create: Joi.object({
    hotelId: Joi.string().required(),
    userId: Joi.string().required(),
    userName: Joi.string().required().min(2).max(100).trim(),
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().min(10).max(1000).trim(),
    stayDate: Joi.date().max('now'),
  }),
  update: Joi.object({
    rating: Joi.number().min(1).max(5),
    comment: Joi.string().min(10).max(1000).trim(),
  }),
};

// Contact validation schemas
export const contactSchema = {
  send: Joi.object({
    name: Joi.string().required().min(2).max(100).trim(),
    email: Joi.string().email().required(),
    subject: Joi.string().required().min(3).max(200).trim(),
    message: Joi.string().required().min(10).max(2000).trim(),
  }),
  newsletter: Joi.object({
    email: Joi.string().email().required(),
  }),
};

// Offer validation schemas
export const offerSchema = {
  create: Joi.object({
    title: Joi.string().required().min(5).max(100).trim(),
    description: Joi.string().required().min(10).max(500).trim(),
    discount: Joi.number().required().min(0).max(100),
    validFrom: Joi.date().required(),
    validUntil: Joi.date().required().greater(Joi.ref('validFrom')),
    hotelId: Joi.string(),
    image: Joi.string().uri(),
    isActive: Joi.boolean().default(true),
  }),
  update: Joi.object({
    title: Joi.string().min(5).max(100).trim(),
    description: Joi.string().min(10).max(500).trim(),
    discount: Joi.number().min(0).max(100),
    validFrom: Joi.date(),
    validUntil: Joi.date(),
    hotelId: Joi.string(),
    image: Joi.string().uri(),
    isActive: Joi.boolean(),
  }),
};

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    
    req.body = value;
    next();
  };
};

export default {
  hotelSchema,
  bookingSchema,
  reviewSchema,
  contactSchema,
  offerSchema,
  validate,
};
