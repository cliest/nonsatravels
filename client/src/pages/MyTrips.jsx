import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/AuthContext';
import {
  FaPlus,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaTrash,
  FaEdit,
  FaShare,
  FaEye,
} from 'react-icons/fa';
import * as tripAPI from '../services/tripAPI';
import { toast } from '../utils/toast';
import Title from '../components/Title';
import Loading from '../components/Loading';

const MyTrips = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, planning, confirmed, completed

  useEffect(() => {
    if (isLoaded && user) {
      fetchTrips();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await tripAPI.getMyTrips();
      setTrips(data);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await tripAPI.deleteTrip(tripId);
      toast.success('Trip deleted successfully');
      fetchTrips();
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const handleShareTrip = async (tripId) => {
    try {
      const { shareUrl } = await tripAPI.generateShareLink(tripId);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  if (loading || !isLoaded) return <Loading />;

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FaCalendarAlt className="text-6xl text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign In to View Your Trips</h2>
            <p className="text-gray-600 mb-8">
              Create an account or sign in to start planning your trips and managing your itineraries.
            </p>
            <Link
              to="/login"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold inline-block"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <Title title="My Trips" subtitle="Manage your travel plans" />
          <button
            onClick={() => navigate('/trip-planner')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FaPlus />
            New Trip
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'planning', 'confirmed', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No trips yet' : `No ${filter} trips`}
            </h3>
            <p className="text-gray-600 mb-6">
              Start planning your next adventure
            </p>
            <button
              onClick={() => navigate('/trip-planner')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <FaPlus />
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Cover Image */}
                <div className="h-48 bg-primary relative">
                  {trip.coverImage ? (
                    <img
                      src={trip.coverImage}
                      alt={trip.tripName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FaMapMarkerAlt className="text-6xl text-white opacity-50" />
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </div>
                </div>

                {/* Trip Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {trip.tripName}
                  </h3>
                  
                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {trip.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 text-primary" />
                      <span>
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-primary" />
                      <span>
                        {trip.destinations.length} destination{trip.destinations.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUsers className="mr-2 text-primary" />
                      <span>{trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="font-bold text-gray-900">
                        {calculateDuration(trip.startDate, trip.endDate)} days
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <FaEye />
                      View
                    </button>
                    <button
                      onClick={() => handleShareTrip(trip.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Share trip"
                    >
                      <FaShare />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete trip"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrips;
