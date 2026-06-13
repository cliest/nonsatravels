import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHotel,
  FaUsers,
  FaDollarSign,
  FaClock,
  FaArrowLeft,
  FaInfoCircle,
} from 'react-icons/fa';
import * as tripAPI from '../services/tripAPI';
import { useCurrency } from '../context/CurrencyContext';
import { toast } from '../utils/toast';
import Loading from '../components/Loading';

const SharedTrip = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { convertPrice, currency } = useCurrency();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrip();
  }, [token]);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const data = await tripAPI.getTripByToken(token);
      setTrip(data);
    } catch (error) {
      toast.error('Failed to load trip');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      sightseeing: 'bg-blue-100 text-blue-800',
      adventure: 'bg-orange-100 text-orange-800',
      dining: 'bg-purple-100 text-purple-800',
      shopping: 'bg-pink-100 text-pink-800',
      culture: 'bg-green-100 text-green-800',
      entertainment: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  if (loading) return <Loading />;
  if (!trip) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Back to Home
          </button>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <FaInfoCircle className="inline mr-1" /> You're viewing a shared trip itinerary. Want to create your own?
              <button
                onClick={() => navigate('/trip-planner')}
                className="ml-2 underline font-medium hover:text-blue-600"
              >
                Start planning
              </button>
            </p>
          </div>
        </div>

        {/* Trip Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="h-64 bg-primary relative">
            {trip.coverImage ? (
              <img
                src={trip.coverImage}
                alt={trip.tripName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FaMapMarkerAlt className="text-8xl text-white opacity-50" />
              </div>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.tripName}</h1>
            {trip.description && (
              <p className="text-gray-600 mb-4">{trip.description}</p>
            )}

            {/* Trip Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <FaCalendarAlt className="text-2xl text-primary mb-2" />
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="font-bold text-gray-900">{trip.duration} days</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <FaMapMarkerAlt className="text-2xl text-primary mb-2" />
                <p className="text-sm text-gray-600 mb-1">Destinations</p>
                <p className="font-bold text-gray-900">{trip.destinations.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <FaUsers className="text-2xl text-primary mb-2" />
                <p className="text-sm text-gray-600 mb-1">Travelers</p>
                <p className="font-bold text-gray-900">{trip.travelers}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <FaDollarSign className="text-2xl text-primary mb-2" />
                <p className="text-sm text-gray-600 mb-1">Est. Cost</p>
                <p className="font-bold text-gray-900">
                  {convertPrice(trip.estimatedCost)} {currency.symbol}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="mt-4 flex items-center gap-4 text-gray-600">
              <span className="font-medium">
                {formatDate(trip.startDate)}
              </span>
              <span>→</span>
              <span className="font-medium">
                {formatDate(trip.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>

          <div className="space-y-8">
            {trip.destinations.map((destination, index) => {
              const checkIn = new Date(destination.checkIn);
              const checkOut = new Date(destination.checkOut);
              const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

              return (
                <div key={destination.id} className="relative pl-8 border-l-4 border-primary">
                  {/* Destination Marker */}
                  <div className="absolute -left-4 top-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {destination.city}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(destination.checkIn)} - {formatDate(destination.checkOut)}
                          <span className="ml-2">({nights} night{nights !== 1 ? 's' : ''})</span>
                        </p>
                      </div>
                    </div>

                    {/* Hotel */}
                    {destination.hotel && (
                      <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start gap-4">
                          {destination.hotel.images?.[0] && (
                            <img
                              src={destination.hotel.images[0]}
                              alt={destination.hotel.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">
                              <FaHotel className="inline mr-2 text-primary" />
                              {destination.hotel.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {destination.hotel.address}
                            </p>
                            <p className="text-primary font-bold">
                              {convertPrice(destination.hotel.pricePerNight)} {currency.symbol} / night
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {destination.notes && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">{destination.notes}</p>
                      </div>
                    )}

                    {/* Activities */}
                    {destination.activities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Activities ({destination.activities.length})
                        </h4>
                        <div className="space-y-3">
                          {destination.activities.map((activity, actIndex) => (
                            <div
                              key={activity.id || actIndex}
                              className="bg-white border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-semibold text-gray-900">{activity.name}</h5>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(activity.category)}`}>
                                  {activity.category}
                                </span>
                              </div>

                              {activity.description && (
                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                              )}

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {activity.date && (
                                  <span className="flex items-center">
                                    <FaCalendarAlt className="mr-1 text-primary" />
                                    {formatDate(activity.date)}
                                  </span>
                                )}
                                {activity.time && (
                                  <span className="flex items-center">
                                    <FaClock className="mr-1 text-primary" />
                                    {formatTime(activity.time)}
                                  </span>
                                )}
                                {activity.duration && (
                                  <span className="flex items-center">
                                    <FaClock className="mr-1 text-primary" />
                                    {activity.duration}
                                  </span>
                                )}
                                {activity.estimatedCost > 0 && (
                                  <span className="flex items-center font-medium">
                                    <FaDollarSign className="mr-1 text-primary" />
                                    {convertPrice(activity.estimatedCost)} {currency.symbol}
                                  </span>
                                )}
                              </div>

                              {activity.location && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <FaMapMarkerAlt className="inline mr-1 text-primary" />
                                  {activity.location}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-primary rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Plan Your Own Adventure</h3>
          <p className="mb-6">Create custom itineraries, add activities, and share with friends</p>
          <button
            onClick={() => navigate('/trip-planner')}
            className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Planning
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedTrip;
