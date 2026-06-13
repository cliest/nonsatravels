import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/AuthContext';
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaHotel, 
  FaSave,
  FaTimes,
  FaTrash
} from 'react-icons/fa';
import * as tripAPI from '../services/tripAPI';
import { hotelAPI } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { toast } from '../utils/toast';
import Title from '../components/Title';

const TripPlanner = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { convertPrice, currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [showHotelSearch, setShowHotelSearch] = useState(false);
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(null);

  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await hotelAPI.getAll();
      setHotels(response.data?.hotels || response.data || []);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addDestination = async () => {
    try {
      // Replace with actual API call to add destination
      const newDestination = await tripAPI.addDestination();
      setTripData(prev => ({
        ...prev,
        destinations: [...prev.destinations, newDestination],
      }));
    } catch (error) {
      toast.error("Failed to add destination");
    }
  };

  const updateDestination = (index, field, value) => {
    const updatedDestinations = [...tripData.destinations];
    updatedDestinations[index][field] = value;
    setTripData(prev => ({
      ...prev,
      destinations: updatedDestinations,
    }));
  };

  const removeDestination = (index) => {
    const updatedDestinations = tripData.destinations.filter((_, i) => i !== index);
    setTripData(prev => ({
      ...prev,
      destinations: updatedDestinations,
    }));
  };

  const selectHotelForDestination = (hotel) => {
    if (selectedDestinationIndex !== null) {
      const updatedDestinations = [...tripData.destinations];
      updatedDestinations[selectedDestinationIndex].hotel = hotel.id;
      updatedDestinations[selectedDestinationIndex].city = hotel.city;
      setTripData(prev => ({
        ...prev,
        destinations: updatedDestinations,
      }));
      setShowHotelSearch(false);
      setSelectedDestinationIndex(null);
      toast.success(`${hotel.name} added to your trip`);
    }
  };

  const addActivity = (destinationIndex) => {
    const updatedDestinations = [...tripData.destinations];
    updatedDestinations[destinationIndex].activities.push({
      name: '',
      description: '',
      date: '',
      time: '',
      location: '',
      estimatedCost: 0,
      duration: '',
      category: 'other',
    });
    setTripData(prev => ({
      ...prev,
      destinations: updatedDestinations,
    }));
  };

  const updateActivity = (destinationIndex, activityIndex, field, value) => {
    const updatedDestinations = [...tripData.destinations];
    updatedDestinations[destinationIndex].activities[activityIndex][field] = value;
    setTripData(prev => ({
      ...prev,
      destinations: updatedDestinations,
    }));
  };

  const removeActivity = (destinationIndex, activityIndex) => {
    const updatedDestinations = [...tripData.destinations];
    updatedDestinations[destinationIndex].activities.splice(activityIndex, 1);
    setTripData(prev => ({
      ...prev,
      destinations: updatedDestinations,
    }));
  };

  const getSelectedHotel = (hotelId) => {
    return hotels.find(h => h.id === hotelId);
  };

  const calculateTripDuration = () => {
    if (!tripData.startDate || !tripData.endDate) return 0;
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSaveTrip = async () => {
    // Validation
    if (!tripData.tripName || !tripData.startDate || !tripData.endDate) {
      toast.error('Please fill in trip name and dates');
      return;
    }

    if (tripData.destinations.length === 0) {
      toast.error('Please add at least one destination');
      return;
    }

    setLoading(true);
    try {
      await tripAPI.createTrip(tripData);
      toast.success('Trip created successfully!');
      navigate('/my-trips');
    } catch (error) {
      toast.error('Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  // Show sign-in prompt if not authenticated
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FaCalendarAlt className="text-6xl text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign In to Plan Your Trip</h2>
            <p className="text-gray-600 mb-8">
              Create an account or sign in to start planning your perfect itinerary with multiple destinations and activities.
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
        <Title title="Plan Your Trip" subtitle="Create your perfect itinerary" />

        {/* Trip Basic Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Name *
              </label>
              <input
                type="text"
                name="tripName"
                value={tripData.tripName}
                onChange={handleInputChange}
                placeholder="e.g., Summer Vacation 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Travelers
              </label>
              <input
                type="number"
                name="travelers"
                value={tripData.travelers}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={tripData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={tripData.endDate}
                onChange={handleInputChange}
                min={tripData.startDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={tripData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Describe your trip..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget ({currency.code})
            </label>
            <input
              type="number"
              name="totalBudget"
              value={tripData.totalBudget}
              onChange={handleInputChange}
              min="0"
              placeholder="Total budget for the trip"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {tripData.startDate && tripData.endDate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <FaCalendarAlt className="inline mr-2 text-primary" />
                Trip Duration: <span className="font-bold">{calculateTripDuration()} days</span>
              </p>
            </div>
          )}
        </div>

        {/* Destinations */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Destinations</h2>
            <button
              onClick={addDestination}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <FaPlus /> Add Destination
            </button>
          </div>

          {tripData.destinations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaMapMarkerAlt className="text-6xl mx-auto mb-4 opacity-50" />
              <p>No destinations added yet</p>
              <p className="text-sm">Start planning by adding your first destination</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tripData.destinations.map((destination, index) => {
                const selectedHotel = destination.hotel ? getSelectedHotel(destination.hotel) : null;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        Destination {index + 1}
                      </h3>
                      <button
                        onClick={() => removeDestination(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={destination.city}
                          onChange={(e) => updateDestination(index, 'city', e.target.value)}
                          placeholder="Enter city name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hotel
                        </label>
                        <button
                          onClick={() => {
                            setSelectedDestinationIndex(index);
                            setShowHotelSearch(true);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left hover:border-primary transition-colors flex items-center justify-between"
                        >
                          <span className={selectedHotel ? 'text-gray-900' : 'text-gray-500'}>
                            {selectedHotel ? selectedHotel.name : 'Select hotel'}
                          </span>
                          <FaHotel className="text-primary" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-in
                        </label>
                        <input
                          type="date"
                          value={destination.checkIn}
                          onChange={(e) => updateDestination(index, 'checkIn', e.target.value)}
                          min={tripData.startDate}
                          max={tripData.endDate}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out
                        </label>
                        <input
                          type="date"
                          value={destination.checkOut}
                          onChange={(e) => updateDestination(index, 'checkOut', e.target.value)}
                          min={destination.checkIn || tripData.startDate}
                          max={tripData.endDate}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={destination.notes}
                        onChange={(e) => updateDestination(index, 'notes', e.target.value)}
                        rows="2"
                        placeholder="Any notes for this destination..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Activities */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-900">Activities</h4>
                        <button
                          onClick={() => addActivity(index)}
                          className="text-sm flex items-center gap-1 text-primary hover:text-primary-dark"
                        >
                          <FaPlus /> Add Activity
                        </button>
                      </div>

                      {destination.activities.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No activities added</p>
                      ) : (
                        <div className="space-y-3">
                          {destination.activities.map((activity, activityIndex) => (
                            <div key={activityIndex} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <input
                                  type="text"
                                  value={activity.name}
                                  onChange={(e) => updateActivity(index, activityIndex, 'name', e.target.value)}
                                  placeholder="Activity name"
                                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm mr-2"
                                />
                                <button
                                  onClick={() => removeActivity(index, activityIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="date"
                                  value={activity.date}
                                  onChange={(e) => updateActivity(index, activityIndex, 'date', e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                                />
                                <input
                                  type="time"
                                  value={activity.time}
                                  onChange={(e) => updateActivity(index, activityIndex, 'time', e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                                />
                                <input
                                  type="number"
                                  value={activity.estimatedCost}
                                  onChange={(e) => updateActivity(index, activityIndex, 'estimatedCost', parseFloat(e.target.value))}
                                  placeholder="Cost"
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                                />
                                <select
                                  value={activity.category}
                                  onChange={(e) => updateActivity(index, activityIndex, 'category', e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="other">Other</option>
                                  <option value="sightseeing">Sightseeing</option>
                                  <option value="adventure">Adventure</option>
                                  <option value="dining">Dining</option>
                                  <option value="shopping">Shopping</option>
                                  <option value="culture">Culture</option>
                                  <option value="entertainment">Entertainment</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/my-trips')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTrip}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <FaSave />
            {loading ? 'Saving...' : 'Save Trip'}
          </button>
        </div>
      </div>

      {/* Hotel Search Modal */}
      {showHotelSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">Select a Hotel</h3>
              <button
                onClick={() => {
                  setShowHotelSearch(false);
                  setSelectedDestinationIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    onClick={() => selectHotelForDestination(hotel)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                  >
                    <img
                      src={hotel.images?.[0] || '/placeholder.jpg'}
                      alt={hotel.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-bold text-gray-900 mb-1">{hotel.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <FaMapMarkerAlt className="inline mr-1" />
                      {hotel.city}
                    </p>
                    <p className="text-primary font-bold">
                      {convertPrice(hotel.pricePerNight)} {currency.symbol} / night
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
