import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faInfoCircle, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const DynamicPriceDisplay = ({ hotelId, checkIn, checkOut, roomsNeeded = 1, roomTypeId }) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (hotelId && checkIn && checkOut) {
      fetchDynamicPricing();
    }
  }, [hotelId, checkIn, checkOut, roomsNeeded, roomTypeId]);

  const fetchDynamicPricing = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/availability/pricing/${hotelId}?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&roomsNeeded=${roomsNeeded}`;
      if (roomTypeId) url += `&roomTypeId=${roomTypeId}`;

      const response = await api.get(url);

      if (response.data.success) {
        setPricing(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch pricing');
      }
    } catch (err) {
      setError('Error loading pricing');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    if (!pricing) return 0;
    return pricing.pricePerNight * calculateTotalNights() * roomsNeeded;
  };

  const calculateBaseTotalPrice = () => {
    if (!pricing) return 0;
    return pricing.basePrice * calculateTotalNights() * roomsNeeded;
  };

  const getSavings = () => {
    const baseTotal = calculateBaseTotalPrice();
    const finalTotal = calculateTotalPrice();
    return baseTotal - finalTotal;
  };

  const getPriceChangeIndicator = () => {
    if (!pricing) return null;
    const savings = getSavings();
    
    if (savings > 0) {
      return (
        <div className="price-indicator savings">
          <FontAwesomeIcon icon={faArrowDown} />
          <span>Save ${savings.toFixed(2)}</span>
        </div>
      );
    } else if (savings < 0) {
      return (
        <div className="price-indicator increase">
          <FontAwesomeIcon icon={faArrowUp} />
          <span>${Math.abs(savings).toFixed(2)} above base</span>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="price-display loading">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading prices...
      </div>
    );
  }

  if (error) {
    return <div className="price-display error">{error}</div>;
  }

  if (!pricing) {
    return (
      <div className="price-display placeholder">
        Select dates to see pricing
      </div>
    );
  }

  const totalNights = calculateTotalNights();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="dynamic-price-display">
      {/* Main Price Display */}
      <div className="price-main">
        <div className="price-label">Total Price</div>
        <div className="price-amount">
          ${totalPrice.toFixed(2)}
        </div>
        <div className="price-details">
          ${pricing.pricePerNight.toFixed(2)} × {totalNights} night{totalNights !== 1 ? 's' : ''} × {roomsNeeded} room{roomsNeeded !== 1 ? 's' : ''}
        </div>
        {getPriceChangeIndicator()}
      </div>

      {/* Price Breakdown Toggle */}
      <button 
        className="breakdown-toggle"
        onClick={() => setShowBreakdown(!showBreakdown)}
      >
        <FontAwesomeIcon icon={faInfoCircle} />
        {showBreakdown ? 'Hide' : 'Show'} Price Breakdown
      </button>

      {/* Detailed Breakdown */}
      {showBreakdown && pricing.breakdown && (
        <div className="price-breakdown">
          <h4>Price Breakdown</h4>
          
          <div className="breakdown-item">
            <span>Base Price</span>
            <span>${pricing.basePrice.toFixed(2)}/night</span>
          </div>

          {pricing.breakdown.peakSeasonApplied && (
            <div className="breakdown-item multiplier">
              <span>
                <FontAwesomeIcon icon={faArrowUp} /> Peak Season
              </span>
              <span>+{((pricing.breakdown.peakSeasonMultiplier - 1) * 100).toFixed(0)}%</span>
            </div>
          )}

          {pricing.breakdown.highDemandApplied && (
            <div className="breakdown-item multiplier">
              <span>
                <FontAwesomeIcon icon={faArrowUp} /> High Demand
              </span>
              <span>+{((pricing.breakdown.highDemandMultiplier - 1) * 100).toFixed(0)}%</span>
            </div>
          )}

          {pricing.breakdown.lowOccupancyApplied && (
            <div className="breakdown-item discount">
              <span>
                <FontAwesomeIcon icon={faArrowDown} /> Low Occupancy Discount
              </span>
              <span>-{((1 - pricing.breakdown.lowOccupancyDiscount) * 100).toFixed(0)}%</span>
            </div>
          )}

          {pricing.breakdown.earlyBirdApplied && (
            <div className="breakdown-item discount">
              <span>
                <FontAwesomeIcon icon={faArrowDown} /> Early Bird Discount
              </span>
              <span>-{((1 - pricing.breakdown.earlyBirdDiscount) * 100).toFixed(0)}%</span>
            </div>
          )}

          {pricing.breakdown.lastMinuteApplied && (
            <div className="breakdown-item multiplier">
              <span>
                <FontAwesomeIcon icon={faArrowUp} /> Last Minute
              </span>
              <span>+{((pricing.breakdown.lastMinuteMultiplier - 1) * 100).toFixed(0)}%</span>
            </div>
          )}

          {pricing.breakdown.weekendApplied && (
            <div className="breakdown-item multiplier">
              <span>
                <FontAwesomeIcon icon={faArrowUp} /> Weekend Rate
              </span>
              <span>+{((pricing.breakdown.weekendMultiplier - 1) * 100).toFixed(0)}%</span>
            </div>
          )}

          <div className="breakdown-divider"></div>

          <div className="breakdown-item final">
            <span>Final Rate per Night</span>
            <span>${pricing.pricePerNight.toFixed(2)}</span>
          </div>
        </div>
      )}

      <style>{`
        .dynamic-price-display {
          background: #2b3990;
          border-radius: 12px;
          padding: 24px;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .price-main {
          text-align: center;
          margin-bottom: 16px;
        }

        .price-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .price-amount {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .price-details {
          font-size: 14px;
          opacity: 0.8;
        }

        .price-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .price-indicator.savings {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .price-indicator.increase {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .breakdown-toggle {
          width: 100%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .breakdown-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .price-breakdown {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .price-breakdown h4 {
          font-size: 16px;
          margin-bottom: 12px;
          opacity: 0.9;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .breakdown-item.multiplier {
          color: #fca5a5;
        }

        .breakdown-item.discount {
          color: #6ee7b7;
        }

        .breakdown-item.final {
          font-weight: bold;
          font-size: 16px;
          padding-top: 12px;
        }

        .breakdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
          margin: 8px 0;
        }

        .price-display {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          color: #6b7280;
        }

        .price-display.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .price-display.error {
          background: #fee2e2;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

DynamicPriceDisplay.propTypes = {
  hotelId: PropTypes.string.isRequired,
  checkIn: PropTypes.instanceOf(Date),
  checkOut: PropTypes.instanceOf(Date),
  roomsNeeded: PropTypes.number,
};

export default DynamicPriceDisplay;
