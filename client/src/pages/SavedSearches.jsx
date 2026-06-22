import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { savedSearchAPI } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faBell, faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "../utils/toast";

const SavedSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const res = await savedSearchAPI.getAll();
      if (res.data.success) setSearches(res.data.data);
    } catch {
      toast.error("Failed to load saved searches");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await savedSearchAPI.delete(id);
      setSearches(searches.filter(s => s.id !== id));
      toast.success("Alert removed");
    } catch {
      toast.error("Failed to remove alert");
    }
  };

  const handleSearch = (search) => {
    const params = new URLSearchParams();
    if (search.city) params.set("city", search.city);
    if (search.checkIn) params.set("checkIn", search.checkIn.split("T")[0]);
    if (search.checkOut) params.set("checkOut", search.checkOut.split("T")[0]);
    if (search.guests) params.set("guests", search.guests);
    navigate(`/hotels?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <FontAwesomeIcon icon={faBell} className="text-2xl text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
            <p className="text-sm text-gray-500">We'll email you when prices drop for your saved searches</p>
          </div>
        </div>

        {searches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FontAwesomeIcon icon={faSearch} className="text-5xl text-gray-200 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No saved searches yet</h2>
            <p className="text-gray-500 mb-6">Search for hotels with specific dates and click "Save Search" to get price alerts.</p>
            <button onClick={() => navigate("/hotels")} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium">
              Browse Hotels
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => (
              <div key={search.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {search.city && <span className="text-sm font-semibold text-gray-900">{search.city}</span>}
                    <span className="text-xs text-gray-400">{search.guests} room{search.guests > 1 ? "s" : ""}</span>
                    {!search.isActive && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Expired</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    {search.checkIn && new Date(search.checkIn).toLocaleDateString()} — {search.checkOut && new Date(search.checkOut).toLocaleDateString()}
                    {search.lastNotifiedPrice && <span className="ml-2 text-primary font-medium">Last price: ${search.lastNotifiedPrice.toFixed(0)}/night</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleSearch(search)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                    Search Again
                  </button>
                  <button onClick={() => handleDelete(search.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
