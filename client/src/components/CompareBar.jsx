import { useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useCurrency } from "../context/CurrencyContext";

const CompareBar = () => {
  const navigate = useNavigate();
  const { compareHotels, removeFromCompare, clearCompare, compareCount } = useCompare();
  const { formatPrice } = useCurrency();

  if (compareCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-white shadow-2xl z-40 animate-slideUp">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selected Hotels */}
          <div className="flex-1 flex items-center gap-3 overflow-x-auto">
            <span className="text-sm font-semibold whitespace-nowrap">
              Compare ({compareCount}/3):
            </span>
            
            <div className="flex gap-2">
              {compareHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 whitespace-nowrap"
                >
                  <img
                    src={hotel.images?.[0] || hotel.image}
                    alt={hotel.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {hotel.name}
                    </span>
                    <span className="text-xs opacity-90">
                      {formatPrice(hotel.pricePerNight)}/night
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCompare(hotel.id)}
                    className="ml-2 hover:bg-white/30 rounded-full p-1 transition-colors"
                    aria-label="Remove"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
            <button
              onClick={() => navigate("/compare")}
              disabled={compareCount < 2}
              className="px-6 py-2 bg-white text-primary rounded-lg text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              Compare Now
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
