import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelAPI, bookingAPI, reviewAPI, offerAPI, testimonialAPI, statsAPI } from '../services/api';
import { toast } from '../utils/toast';

const STALE_5MIN = 5 * 60 * 1000;
const STALE_10MIN = 10 * 60 * 1000;

export const queryKeys = {
  hotels: {
    all: ['hotels'],
    list: (params) => ['hotels', 'list', params],
    detail: (id) => ['hotels', 'detail', id],
    featured: ['hotels', 'featured'],
  },
  bookings: {
    all: ['bookings'],
    list: (params) => ['bookings', 'list', params],
    detail: (id) => ['bookings', 'detail', id],
    stats: ['bookings', 'stats'],
  },
  reviews: {
    all: ['reviews'],
    byHotel: (hotelId) => ['reviews', 'hotel', hotelId],
  },
  offers: {
    all: ['offers'],
    detail: (id) => ['offers', 'detail', id],
  },
  testimonials: {
    all: ['testimonials'],
    admin: ['testimonials', 'admin'],
  },
  stats: {
    all: ['stats'],
  },
};

// ============== HOTEL HOOKS ==============

export const useHotels = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.hotels.list(params),
    queryFn: async () => {
      const response = await hotelAPI.getAll(params);
      return response.data;
    },
    staleTime: STALE_5MIN,
  });
};

export const useHotel = (id) => {
  return useQuery({
    queryKey: queryKeys.hotels.detail(id),
    queryFn: async () => {
      const response = await hotelAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: STALE_5MIN,
  });
};

export const useFeaturedHotels = () => {
  return useQuery({
    queryKey: queryKeys.hotels.featured,
    queryFn: async () => {
      const response = await hotelAPI.getFeatured();
      return response.data;
    },
    staleTime: STALE_10MIN,
  });
};

export const useCreateHotel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => hotelAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
      toast.success('Hotel created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create hotel');
    },
  });
};

export const useUpdateHotel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => hotelAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.detail(id) });
      toast.success('Hotel updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update hotel');
    },
  });
};

export const useDeleteHotel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => hotelAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
      toast.success('Hotel deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete hotel');
    },
  });
};

export const useToggleFeatured = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => hotelAPI.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.featured });
      toast.success('Featured status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update featured status');
    },
  });
};

// ============== BOOKING HOOKS ==============

export const useBookings = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: async () => {
      const response = await bookingAPI.getAll(params);
      return response.data;
    },
    staleTime: STALE_5MIN,
  });
};

export const useBooking = (id) => {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: async () => {
      const response = await bookingAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: STALE_5MIN,
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: queryKeys.bookings.stats,
    queryFn: async () => {
      const response = await bookingAPI.getStats();
      return response.data;
    },
    staleTime: STALE_5MIN,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => bookingAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      toast.success('Booking created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => bookingAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      toast.success('Booking status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingAPI.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    },
  });
};

// ============== REVIEW HOOKS ==============

export const useReviews = (hotelId) => {
  return useQuery({
    queryKey: queryKeys.reviews.byHotel(hotelId),
    queryFn: async () => {
      const response = await reviewAPI.getByHotel(hotelId);
      return response.data;
    },
    enabled: !!hotelId,
    staleTime: STALE_5MIN,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => reviewAPI.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byHotel(variables.hotelId) });
      toast.success('Review submitted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });
};

// ============== OFFER HOOKS ==============

export const useOffers = () => {
  return useQuery({
    queryKey: queryKeys.offers.all,
    queryFn: async () => {
      const response = await offerAPI.getAll();
      return response.data;
    },
    staleTime: STALE_10MIN,
  });
};

export const useOffer = (id) => {
  return useQuery({
    queryKey: queryKeys.offers.detail(id),
    queryFn: async () => {
      const response = await offerAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: STALE_10MIN,
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => offerAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all });
      toast.success('Offer created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create offer');
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => offerAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all });
      toast.success('Offer updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update offer');
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => offerAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all });
      toast.success('Offer deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete offer');
    },
  });
};

// ============== TESTIMONIAL HOOKS ==============

export const useTestimonials = () => {
  return useQuery({
    queryKey: queryKeys.testimonials.all,
    queryFn: async () => {
      const response = await testimonialAPI.getAll();
      return response.data;
    },
    staleTime: STALE_10MIN,
  });
};

export const useAdminTestimonials = () => {
  return useQuery({
    queryKey: queryKeys.testimonials.admin,
    queryFn: async () => {
      const response = await testimonialAPI.getAllAdmin();
      return response.data;
    },
    staleTime: STALE_5MIN,
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => testimonialAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all });
      toast.success('Testimonial created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create testimonial');
    },
  });
};

// ============== STATS HOOKS ==============

export const useStats = () => {
  return useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: async () => {
      const response = await statsAPI.getStats();
      return response.data;
    },
    staleTime: STALE_10MIN,
  });
};
