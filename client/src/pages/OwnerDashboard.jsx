import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hotelAPI, bookingAPI } from "../services/api";
import { useUser } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel, faCalendarCheck, faDollarSign, faEdit, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from "../utils/toast";

const OwnerDashboard = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) { navigate("/login"); return; }
    if (user?.role !== "hotel_owner" && user?.role !== "admin") {
      toast.error("Access denied"); navigate("/"); return;
    }
    fetchData();
  }, [isSignedIn, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, bookingsRes] = await Promise.all([
        hotelAPI.getMyHotels(),
        bookingAPI.getAll(),
      ]);
      setHotels(hotelsRes.data.data || []);
      const myHotelIds = (hotelsRes.data.data || []).map(h => h.id);
      const myBookings = (bookingsRes.data.data || []).filter(b => myHotelIds.includes(b.hotelId?.id || b.hotelId));
      setBookings(myBookings);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const confirmedBookings = bookings.filter(b => ["confirmed", "completed", "payment_confirmed"].includes(b.status));
  const totalRevenue = confirmedBookings.reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hotel Owner Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your properties and track bookings</p>
          </div>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to site
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faHotel} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{hotels.length}</p>
                <p className="text-xs text-gray-500">My Hotels</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                <p className="text-xs text-gray-500">Total Bookings</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faDollarSign} className="text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Hotels */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Hotels</h2>
          {hotels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              <FontAwesomeIcon icon={faHotel} className="text-4xl text-gray-200 mb-3" />
              <p>No hotels assigned to your account yet.</p>
              <p className="text-sm mt-1">Contact the admin to assign hotels to your account.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotels.map(hotel => (
                <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex">
                    {hotel.images?.[0] && (
                      <img src={hotel.images[0]} alt={hotel.name} className="w-32 h-32 object-cover flex-shrink-0" />
                    )}
                    <div className="p-4 flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{hotel.name}</h3>
                      <p className="text-sm text-gray-500">{hotel.city} · {hotel.roomTypes?.length || 0} room types</p>
                      <p className="text-sm text-primary font-semibold mt-1">From ${hotel.pricePerNight}/night</p>
                      <p className="text-xs text-gray-400 mt-1">{hotel.rating} stars · {hotel.totalRooms} rooms</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h2>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              <p>No bookings yet for your hotels.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Hotel</th>
                    <th className="px-4 py-3 font-medium">Dates</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.slice(0, 20).map(b => (
                    <tr key={b.id || b._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.userName}</p>
                        <p className="text-xs text-gray-400">{b.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{b.hotelId?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">${b.totalPrice}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.status === 'confirmed' || b.status === 'completed' ? 'bg-green-100 text-green-700' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
